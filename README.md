![2026-04-1200 59 22-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/0166ff6c-5db3-4f72-a6bb-49d3a83fad02)

<div align="center">

# Cashflow Autopilot

**Liquidity forecasting and cash visibility for finance and ops teams.**

Daily cash balance projection, receivables, recurring obligations, and a focused UI built for decisions — demo-ready with synthetic data, no payment rails.

[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-brightgreen?style=flat-square&logo=spring)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docs.docker.com/compose/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

</div>

---

## Features

- **Forecast** — daily projected balance derived from invoices, obligations, and ledger history
- **Dashboard** — summary KPIs, 30-day chart, upcoming receivables and payables
- **Invoices & obligations** — full CRUD over REST with status tracking
- **Bank transactions** — list, create, delete
- **Scenarios & factoring** — additional modelling screens
- **Landing page** — scroll-driven marketing page at `/intro` with GSAP ScrollTrigger: sticky hero, card overlay, character reveal, neon chart split into 3D flip cards
- **Demo mode** — synthetic seed dataset on empty DB; browser-only fallback when API is unreachable

---

## Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Java 21, Spring Boot 3.3, Spring Data JPA, SpringDoc OpenAPI |
| Database | PostgreSQL 16, Flyway |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, GSAP, Recharts, Radix UI |
| Runtime  | Docker Compose, Nginx (static UI + `/api` proxy) |

---

## Quick start

**Requires:** Docker with Compose v2.

```bash
git clone <repo-url>
cd Backend_Project
docker compose up --build
```

| Service | URL |
|---------|-----|
| Landing | http://localhost:3040/intro |
| App | http://localhost:3040 |
| API | http://localhost:8090/api |
| Swagger UI | http://localhost:8090/swagger-ui.html |
| PostgreSQL | `localhost:5432` · db `cashflow` · user `cashflow` |

First build downloads Maven and npm dependencies — subsequent starts are fast.

On an empty database with demo seed enabled, the app creates **Northwind Demo Ltd** with a USD operating account, sample invoices, obligations, and transaction history. All figures are simulated.

---

## Local development

### Backend

Requires **Java 21** and **Maven**.

```bash
docker compose up postgres -d

mvn -B spring-boot:run
# API      → http://localhost:8060/api
# Swagger  → http://localhost:8060/swagger-ui.html
```

### Frontend

Requires **Node.js 20+**.

```bash
cd frontend
npm ci
npm run dev       # http://localhost:3030  (Vite proxies /api → :8060)
npm run build     # production build
```

---

## API reference

Base path: `/api`. Request/response shapes are in [`frontend/src/types/backend.ts`](frontend/src/types/backend.ts).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/app/info` | Demo / presentation flags |
| GET | `/companies` | List companies |
| POST | `/companies` | Create company |
| DELETE | `/companies/{id}` | Delete company |
| GET | `/cash-accounts/company/{companyId}` | Accounts for company |
| POST | `/cash-accounts` | Create account |
| DELETE | `/cash-accounts/{id}` | Delete account |
| GET | `/invoices/cash-account/{id}` | Invoices |
| POST | `/invoices` | Create invoice |
| DELETE | `/invoices/{id}` | Delete invoice |
| GET | `/obligations/cash-account/{id}` | Obligations |
| POST | `/obligations` | Create obligation |
| DELETE | `/obligations/{id}` | Delete obligation |
| GET | `/bank-transactions/cash-account/{id}` | Transactions |
| POST | `/bank-transactions` | Create transaction |
| DELETE | `/bank-transactions/{id}` | Delete transaction |
| GET | `/forecast` | Params: `cashAccountId`, `startDate`, `days` |
| GET | `/dashboard/summary` | Same params as forecast |

---

## Repository layout

```
Backend_Project/
├── src/main/java/com/cashflow/autopilot/   # controllers, services, domain, dto
├── src/main/resources/
│   ├── application.yaml
│   └── db/migration/                       # Flyway migrations
├── src/test/                               # JUnit + Testcontainers
├── frontend/
│   ├── src/
│   │   ├── pages/                          # Dashboard, Forecast, Invoices, LandingPage …
│   │   ├── components/                     # layout + UI primitives
│   │   ├── contexts/                       # AccountContext
│   │   └── types/                          # backend.ts — shared DTO shapes
│   ├── Dockerfile
│   └── nginx.conf
├── Dockerfile
├── docker-compose.yml
└── pom.xml
```

---

## Configuration

| Variable | Role |
|----------|------|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | JDBC connection |
| `CASHFLOW_DEMO_ENABLED` | Master demo toggle |
| `CASHFLOW_DEMO_SEED_ON_STARTUP` | Seed when no companies exist |
| `CASHFLOW_DEMO_PRESENTATION_MODE` | UI banner + `/app/info` response |
| `CASHFLOW_DEMO_DISCLAIMER` | Short disclaimer string |
| `CASHFLOW_DEMO_CURRENCY_LABEL` | e.g. `USD (simulated)` |

In the Docker frontend build stage `VITE_API_BASE_URL=/api` so the browser hits the same origin and Nginx proxies to the backend container.

---

## Tests

```bash
mvn -B test
```

Integration tests use **Testcontainers** — no local Postgres required. CI runs on push/PR to `main`: Maven test suite + frontend build.

---

## License

MIT — see [LICENSE](LICENSE).
