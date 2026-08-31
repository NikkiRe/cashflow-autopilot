import json
import os
import re
import subprocess
import time
import uuid
from datetime import date, timedelta
from decimal import Decimal
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = os.environ.get("E2E_BASE_URL", "http://localhost:3040").rstrip("/")
START = date(2030, 1, 15)


def request(method, path, payload=None, timeout=10):
    data = None if payload is None else json.dumps(payload).encode()
    headers = {} if data is None else {"Content-Type": "application/json"}
    req = Request(BASE_URL + path, data=data, headers=headers, method=method)
    try:
        response = urlopen(req, timeout=timeout)
    except HTTPError as error:
        response = error
    with response:
        return response.status, response.headers, response.read()


def decode(body):
    return json.loads(body, parse_float=Decimal)


def api(method, path, payload=None, expected=200):
    status, _, body = request(method, path, payload)
    if status != expected:
        raise AssertionError(f"{method} {path}: expected {expected}, got {status}: {body[:1200]!r}")
    return decode(body) if body else None


def wait_http(path, matches, label, timeout=90):
    deadline = time.monotonic() + timeout
    last = "no response"
    while time.monotonic() < deadline:
        try:
            status, headers, body = request("GET", path, timeout=min(10, deadline - time.monotonic()))
            last = f"HTTP {status}, revision={headers.get('X-Projection-Revision')}, body={body[:1200]!r}"
            if status == 200 and matches(headers, body):
                return headers, body
            if status not in (200, 502, 503, 504):
                raise AssertionError(f"{label}: {last}")
        except (URLError, TimeoutError, ConnectionError) as error:
            last = str(error)
        time.sleep(min(1, max(0, deadline - time.monotonic())))
    raise AssertionError(f"{label} did not finish in {timeout}s: {last}")


def forecast_path(account_id):
    return "/api/forecast?" + urlencode({"cashAccountId": account_id, "startDate": START, "days": 3})


def wait_forecast(account_id, rows, minimum_revision, label):
    fields = ("openingBalance", "expectedIn", "expectedOut", "closingBalance")

    def matches(headers, body):
        revision = int(headers["X-Projection-Revision"])
        points = decode(body)
        if revision < minimum_revision or len(points) != len(rows):
            return False
        for offset, (point, amounts) in enumerate(zip(points, rows)):
            if point["date"] != (START + timedelta(days=offset)).isoformat():
                return False
            if any(point[field] != Decimal(amount) for field, amount in zip(fields, amounts)):
                return False
        return True

    headers, _ = wait_http(forecast_path(account_id), matches, label)
    revision = int(headers["X-Projection-Revision"])
    print(f"{label}: revision {revision}", flush=True)
    return revision


def compose(*arguments):
    subprocess.run(["docker", "compose", *arguments], cwd=ROOT, check=True, timeout=45)


def main():
    if not os.environ.get("COMPOSE_PROJECT_NAME"):
        raise RuntimeError("Set COMPOSE_PROJECT_NAME to the disposable Compose project under test")

    wait_http("/api/companies", lambda _, body: isinstance(decode(body), list), "API startup", timeout=120)
    status, _, html = request("GET", "/")
    if status != 200 or b'<div id="root"></div>' not in html:
        raise AssertionError("Nginx did not serve the React entry page")
    asset = re.search(rb'<script[^>]+src="(/assets/[^\"]+\.js)"', html)
    if asset is None:
        raise AssertionError("React entry page has no compiled JavaScript asset")
    status, headers, body = request("GET", asset[1].decode())
    if status != 200 or "javascript" not in headers.get("Content-Type", "") or not body:
        raise AssertionError("Nginx did not serve the compiled JavaScript asset")

    company = api("POST", "/api/companies", {"name": f"E2E {uuid.uuid4().hex[:12]}"}, 201)
    account = api("POST", "/api/cash-accounts", {
        "companyId": company["id"], "name": "E2E account", "currency": "RUB",
    }, 201)
    account_id = account["id"]
    api("POST", "/api/bank-transactions", {
        "cashAccountId": account_id, "bookedAt": "2020-01-01", "amount": "1000.00",
        "currency": "RUB", "direction": "IN",
    }, 201)
    invoice = api("POST", "/api/invoices", {
        "cashAccountId": account_id, "issueDate": "2030-01-10", "dueDate": START.isoformat(),
        "amount": "250.00", "currency": "RUB", "status": "ISSUED",
    }, 201)
    api("POST", "/api/obligations", {
        "cashAccountId": account_id, "name": "E2E expense", "amount": "100.00", "currency": "RUB",
        "nextDueDate": (START + timedelta(days=1)).isoformat(), "recurrence": "NONE",
    }, 201)
    initial_revision = wait_forecast(account_id, [
        (1000, 250, 0, 1250), (1250, 0, 100, 1150), (1150, 0, 0, 1150),
    ], 4, "Initial forecast")

    compose("stop", "--timeout", "10", "forecast-service")
    try:
        transaction = api("POST", "/api/bank-transactions", {
            "cashAccountId": account_id, "bookedAt": "2020-01-02", "amount": "125.00",
            "currency": "RUB", "direction": "OUT",
        }, 201)
        saved = api("GET", f"/api/bank-transactions/{transaction['id']}")
        if saved["amount"] != Decimal(125) or saved["direction"] != "OUT":
            raise AssertionError(f"Source write was not persisted during outage: {saved}")
        api("GET", forecast_path(account_id), expected=503)
        print("Source write succeeded while forecast-service was stopped", flush=True)
    finally:
        compose("start", "forecast-service")

    recovered_revision = wait_forecast(account_id, [
        (875, 250, 0, 1125), (1125, 0, 100, 1025), (1025, 0, 0, 1025),
    ], initial_revision + 1, "Recovered forecast")

    api("DELETE", f"/api/invoices/{invoice['id']}", expected=204)
    api("GET", f"/api/invoices/{invoice['id']}", expected=404)
    wait_forecast(account_id, [
        (875, 0, 0, 875), (875, 0, 100, 775), (775, 0, 0, 775),
    ], recovered_revision + 1, "Forecast after invoice deletion")
    print("E2E passed", flush=True)


if __name__ == "__main__":
    main()
