# DevPulse

> **Know if your deploy made your app better or worse — automatically, every time.**

A lightweight, real-time infrastructure monitoring dashboard for homelab deployments.

## Preview

![DevPulse Dashboard](docs/images/dashboard.png)

![DevPulse Live Demo](docs/images/demo.webp)

---

## How It Works

<p align="center">
  <img src="docs/images/data-flow.png" alt="DevPulse Data Flow" width="700">
</p>

```
Metrics Agent ──writes──► PostgreSQL ◄──reads/writes── Fastify API ──serves──► Dashboard
                            (Drizzle ORM)
```

1. **Metrics Agent** collects CPU %, memory %, and HTTP health every 30s
2. **PostgreSQL** stores all metrics and deploy records via Drizzle ORM
3. **Fastify API** reads/writes data through 6 REST endpoints
4. **Dashboard** polls the API every 5s and renders live charts

---

## Architecture

![Architecture Diagram](docs/images/architecture.jpg)


| Stage              | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| Developer → GitHub | Push to `main` branch                                             |
| GitHub Actions CI  | Compile TS → build Docker image → push to GHCR                    |
| Manual Deploy      | `docker compose pull && up -d` on homelab                         |
| Nginx + Cloudflare | Reverse proxy to port 3000, tunneled publicly                     |
| DevPulse Container | Fastify API + metrics agent (30s async loop) in one container     |
| PostgreSQL         | Stores metrics & deploy records (Docker volume, port 5432)        |
| Dashboard          | Polls API every 5s, renders live charts and deploy health verdicts |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) & Docker Compose

### Quick Start (Docker)

```bash
# Clone the repo
git clone https://github.com/yourusername/devPulse.git
cd devPulse

# Start PostgreSQL, API, and Nginx
docker compose up -d

# Push the database schema
npm run db:push
```

The dashboard will be available at `http://localhost:8081`.

### Local Development

```bash
# Install dependencies
npm install

# Create .env file
echo "DATABASE_URL=postgresql://devpulse:devpulse123@localhost:5432/devpulse" > .env

# Start PostgreSQL only
docker compose up -d db

# Push the database schema
npm run db:push

# Run the app
npx tsx src/index.ts
```

Open `http://localhost:3000`.

---

## Tech Stack

| Layer          | Technologies                             |
| -------------- | ---------------------------------------- |
| Frontend       | HTML5, CSS3, JavaScript, Chart.js        |
| Backend        | TypeScript, Node.js, Fastify             |
| Database       | PostgreSQL, Drizzle ORM                  |
| Infrastructure | Docker Compose, Nginx, Cloudflare Tunnel |
| CI/CD          | GitHub Actions, GHCR                     |

---

## API

| Method | Endpoint                  | Purpose                     |
| ------ | ------------------------- | --------------------------- |
| GET    | `/api/status`             | Application status          |
| GET    | `/api/metrics`            | Latest CPU/memory reading   |
| GET    | `/api/metrics/range`      | Historical metrics          |
| GET    | `/api/deploys`            | Deploy history              |
| GET    | `/api/deploys/:id/health` | Health verdict for a deploy |
| POST   | `/api/deploys/webhook`    | Receive deploy notification |

---

## Database Schema

| Table      | Columns                               |
| ---------- | ------------------------------------- |
| `metrics`  | id, ts, cpu_pct, mem_pct, http_ok     |
| `deploys`  | id, ts, commit_sha, branch, status    |

> **Planned:** `alerts` (threshold breach notifications) and `services` (multi-service health tracking) tables are on the roadmap.

---

## Known Limitations

- **Metric Correlation** — Cannot yet auto-correlate specific commits with metric spikes
- **Deploy Automation** — CI is automated; production deploy remains manual
- **Multi-server** — Single homelab server only
