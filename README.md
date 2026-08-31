# Cashflow Autopilot

Cashflow planning for a small business: invoices, recurring expenses, bank history and a daily balance forecast. The sample dataset uses simulated money.

## Services

- `backend`: Java 21 / Spring Boot API. Owns companies, accounts, invoices, obligations and transactions in PostgreSQL.
- `forecast-service`: consumes account snapshots from Kafka, stores its own PostgreSQL projection and calculates forecasts. It has no connection to the source database.
- `frontend`: React / TypeScript dashboard, served by Nginx.

A business change and its outbox event are committed in one database transaction. Changes to the same account take a revision lock before modifying data. The publisher sends committed events to `cashflow.account-snapshots.v1`, keyed by account ID, then marks them as published. If it crashes between those steps, the event is sent again.

The consumer commits the inbox entry and projection together, before Kafka acknowledges the record. Event IDs handle duplicates; revisions reject older snapshots. Deleting an account emits a retained snapshot with `deleted=true`, so replay cannot restore deleted data. Deleting an invoice, transaction or obligation emits a new snapshot without that item.

The publisher takes a PostgreSQL transaction advisory lock. Only one publisher drains the outbox at a time, including when multiple API instances run. This preserves publication order for the compacted topic. API writes remain concurrent across accounts.

## Run

Requires Docker with Compose v2.

```sh
docker compose up --build
```

Open the [app](http://localhost:3040), [landing page](http://localhost:3040/intro) or [Swagger UI](http://localhost:8090/swagger-ui.html). The public API remains at `http://localhost:8090/api`. Forecast requests are forwarded to the separate service.

PostgreSQL runs on ports 5432 and 5433, with separate databases and credentials for each service. Kafka runs on port 9092. These credentials and the single Kafka broker are for local development.

The demo seed is written once when the source database is empty. It creates an initial outbox snapshot after all invoices, expenses and bank transactions have been inserted. On an existing database, accounts without a revision are snapshotted on startup.

## Consistency and replay

The forecast is eventually consistent. A successful write does not wait for Kafka or the projection. A new account can briefly return HTTP 503 with `Retry-After: 1` from the forecast endpoint while its first snapshot arrives. Existing accounts can briefly show the previous forecast. Responses include `X-Projection-Revision`.

Snapshots include all forecast inputs for one account. This keeps replay and deletion straightforward but is intended for the sample dataset, not unbounded bank history. The default Kafka message limit is about 1 MB. A larger deployment would need incremental events and a separate snapshot/bootstrap mechanism.

The topic uses compaction. The last snapshot for each account, including deletion markers, remains available; consumers must start with `auto-offset-reset=earliest`. To rebuild an empty projection database, set a fresh `KAFKA_GROUP_ID` so existing consumer offsets are not reused. Both database and broker data use named Docker volumes.

If Kafka storage is lost, stop the API, reset `published_at` to `NULL` in `account_outbox`, then restart it. Events are replayed in outbox order. Published outbox rows are deliberately retained in this demo. Permanent listener failures retry without advancing that partition; inspect forecast-service logs and fix the event or deployment before resuming.

Forecast assumptions match the original application: overdue invoices are included on the first day, issued invoices on their due date, and monthly obligations clamp to the last day of a shorter month. This is a planning model, not a payment processor. Forecast horizons are limited to 1 through 366 days; new financial items must use the account currency. Scenarios and factoring screens remain browser-side demonstrations.

## Local development

Requires JDK 21, Maven and Node.js 20+.

```sh
docker compose up -d postgres forecast-db kafka
mvn spring-boot:run
```

In another terminal:

```sh
cd forecast-service
mvn spring-boot:run
```

For the UI:

```sh
cd frontend
npm ci
npm run dev
```

## Tests

```sh
mvn verify
mvn -f forecast-service/pom.xml verify
```

Docker must be running for PostgreSQL Testcontainers. Forecast tests use an embedded Kafka broker. Tests cover the original forecast behavior, transactional rollback, concurrent account changes, demo snapshots, deletion, duplicate/older deliveries, atomic inbox updates and listener restart. GitHub Actions runs both backend suites and the frontend build.

A separate E2E job builds the full Compose stack with Nginx, React, both services, Kafka and two PostgreSQL databases. The Python standard-library script sends every HTTP request through Nginx. It checks the compiled UI assets, creates an account with transactions, an invoice and an obligation, then verifies daily forecast amounts and projection revisions. It stops `forecast-service`, persists another transaction through the API, restarts the service and waits for the updated forecast. Finally, it deletes the invoice and checks that its amount disappears from the projection. Requests and polling have time limits; failed CI runs print container logs and always remove the stack and volumes.

To run the same HTTP E2E scenario locally, use Python 3.12+ and a disposable Compose project. It stops and starts that project's `forecast-service`; the Compose ports must be free.

```sh
export COMPOSE_PROJECT_NAME=cashflow-e2e
docker compose up --build --detach --wait --wait-timeout 180
python3 scripts/e2e.py
docker compose down --volumes --remove-orphans
```

`E2E_BASE_URL` defaults to `http://localhost:3040`. This checks the deployed HTTP flow and static UI assets; it does not drive a browser.

## Stack

Java 21, Spring Boot 3.3, Spring Data JPA, Spring JDBC, PostgreSQL 16, Flyway, Kafka, JUnit, Testcontainers, React 18, TypeScript, Docker Compose.

MIT license.
