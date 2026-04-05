<div align="center">

# Cashflow Autopilot

**Liquidity forecasting and cash visibility for finance and ops teams.**

Daily cash balance projection, receivables, recurring obligations, and a focused UI for decisions — demo-ready with synthetic data, no payment rails.

[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-brightgreen?style=flat-square&logo=spring)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docs.docker.com/compose/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

</div>

---

## Capabilities

- **Forecast** — daily projected balance from invoices, obligations, and ledger history
- **Dashboard** — summary KPIs, chart, upcoming receivables and payables
- **Invoices & obligations** — CRUD-style flows over REST
- **Bank transactions** — list, create, delete
- **Scenarios & factoring** — additional modelling screens (UI + API integration as implemented)
- **Presentation mode** — optional banner and `/api/app/info` for demo disclaimers; seed dataset on empty DB

---

## Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Java 21, Spring Boot 3.3, Spring Data JPA, SpringDoc OpenAPI |
| Database | PostgreSQL 16, Flyway |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion |
| Runtime  | Docker Compose, Nginx (static UI + `/api` proxy) |

---

## Quick start (Docker)

**Requires:** Docker with Compose v2 (`docker compose`).

```bash
git clone <repo-url>
cd Backend_Project
docker compose up --build
```

| Service | URL |
|---------|-----|
| Web UI | http://localhost:3040 |
| API | http://localhost:8090/api |
| OpenAPI (Swagger UI) | http://localhost:8090/swagger-ui.html |
| PostgreSQL | `localhost:5432` · database `cashflow` · user `cashflow` |

First full build may take a few minutes (Maven + npm in images). Later starts are faster.

With an **empty** database and demo seed enabled, the app creates **Northwind Demo Ltd**, a USD operating account, sample invoices, obligations, and bank history. Figures are **simulated**.

If the API is unreachable, the **Dashboard** can still run a **browser-only demo** fallback.

---

## Local development

### Database only (Docker)

```bash
docker compose up postgres -d
```

### Backend

Requires **Java 21** and **Maven** on the PATH (this repo does not ship `mvnw`).

```bash
# Set DB_URL / credentials to match your Postgres, or use defaults in application.yaml
mvn -B spring-boot:run
```

API: http://localhost:8060/api · Swagger: http://localhost:8060/swagger-ui.html

### Frontend

Requires **Node.js 20+**.

```bash
cd frontend
npm ci
npm run dev
```

Dev server: http://localhost:3030 — Vite proxies `/api` to http://localhost:8060.

Production build:

```bash
cd frontend
npm ci
npm run build
```

---

## API overview

Base path: `/api`. Shapes align with [`frontend/src/types/backend.ts`](frontend/src/types/backend.ts).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/app/info` | Demo / presentation flags |
| GET | `/companies` | List companies |
| GET | `/companies/{id}` | Company by id |
| POST | `/companies` | Create company |
| DELETE | `/companies/{id}` | Delete company |
| GET | `/cash-accounts/company/{companyId}` | Cash accounts for company |
| GET | `/cash-accounts/{id}` | Cash account by id |
| POST | `/cash-accounts` | Create cash account |
| DELETE | `/cash-accounts/{id}` | Delete cash account |
| GET | `/invoices/cash-account/{cashAccountId}` | Invoices |
| GET | `/invoices/{id}` | Invoice by id |
| POST | `/invoices` | Create invoice |
| DELETE | `/invoices/{id}` | Delete invoice |
| GET | `/obligations/cash-account/{cashAccountId}` | Obligations |
| GET | `/obligations/{id}` | Obligation by id |
| POST | `/obligations` | Create obligation |
| DELETE | `/obligations/{id}` | Delete obligation |
| GET | `/bank-transactions/cash-account/{cashAccountId}` | Transactions |
| GET | `/bank-transactions/{id}` | Transaction by id |
| POST | `/bank-transactions` | Create transaction |
| DELETE | `/bank-transactions/{id}` | Delete transaction |
| GET | `/forecast` | Query: `cashAccountId`, `startDate`, `days` |
| GET | `/dashboard/summary` | Same query params |

---

## Repository layout

```
Backend_Project/
├── src/main/java/com/cashflow/autopilot/   # controllers, services, repositories, domain, dto
├── src/main/resources/
│   ├── application.yaml
│   └── db/migration/                       # Flyway
├── src/test/                               # JUnit + Testcontainers
├── frontend/
│   ├── src/                                # pages, components, contexts, lib, types
│   ├── Dockerfile
│   └── nginx.conf
├── Dockerfile                              # Backend image
├── docker-compose.yml
├── pom.xml
└── .github/workflows/ci.yml                # Maven tests + frontend build
```

---

## Configuration

Docker Compose sets, among others:

| Variable | Role |
|----------|------|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | JDBC |
| `CASHFLOW_DEMO_*` | Demo flags (Spring relaxed binding) |

In the **frontend build** stage, `VITE_API_BASE_URL=/api` so the browser talks to the same origin and Nginx proxies to the backend.

**Demo properties** (`application.yaml` / env):

| Property | Typical use |
|----------|-------------|
| `cashflow.demo.enabled` | Master toggle for demo features |
| `cashflow.demo.seed-on-startup` | Seed when there are no companies |
| `cashflow.demo.presentation-mode` | UI banner + `/app/info` |
| `cashflow.demo.disclaimer` | Short disclaimer text |
| `cashflow.demo.currency-label` | e.g. `USD (simulated)` |

---

## CI

On push/PR to `main` or `master`:

- Backend: `mvn -B test` (Java 21, Maven on Ubuntu runner)
- Frontend: `npm ci && npm run build` in `frontend/`

---

## Tests

```bash
mvn -B test
```

Integration tests use **Testcontainers** (PostgreSQL). No local Postgres required for tests.

---

## License

MIT — see [LICENSE](LICENSE).
