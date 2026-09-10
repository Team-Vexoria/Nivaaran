# NIVAARAN — Local Demo Bootstrap

One command starts the complete demo stack: Postgres (PostGIS), Redis, the backend API, and the frontend.

---

## Quick Start

```bash
# From the repository root
docker compose up --build
```

This is the only documented startup command. No separate database setup, no manual migrations, no seed scripts — everything runs automatically inside the backend container on first boot.

---

## What Happens on First Boot

| Step | What runs | Fails visibly? |
|------|-----------|----------------|
| 1 | Postgres starts with PostGIS; Redis starts | — |
| 2 | Backend waits for both healthchecks to pass | — |
| 3 | `prisma migrate deploy` — creates all tables, enums, spatial indexes | Yes — container exits |
| 4 | Seed: 24 Jharkhand districts + blocks | Yes — container exits |
| 5 | Seed: 13 RBAC roles, ~24 permissions, role→permission grants, super-admin user | Yes — container exits |
| 6 | Seed: 9 demo users + 1 challenge with full flood scenario + 3 organizations | Yes — container exits |
| 7 | Backend API starts on port 5000 | — |
| 8 | Frontend Nginx starts on port 3000, proxies `/api/*` → backend | — |

If any step 3–6 fails the container stops with a clear error — no silent failures.

---

## Verify It's Working

```bash
# Health check (confirms Postgres connectivity)
curl http://localhost:5000/api/health
# → {"status":"OK","service":"NIVAARAN Backend API","db":"Connected","timestamp":"..."}

# Frontend
curl http://localhost:3000
# → serves the NIVAARAN SPA HTML

# Open in browser
start http://localhost:3000
```

---

## Demo Readiness Check

One command answers the only question that matters before a rehearsal: **can this
environment be demoed end-to-end right now, without manual fixes?** Run it from the
`backend/` directory once the stack is up:

```bash
cd backend
npm run verify
```

It prints one line per check and exits non-zero the moment any critical check
fails, so a broken environment is obvious in well under a minute:

```
  NIVAARAN demo readiness — 2026-09-10T12:00:00.000Z
  ────────────────────────────────────────────────────────────
  [ OK ] Config                 NODE_ENV=development · PORT=5000 · demo-auth=on · firebase=not-required (absent)
  [ OK ] Database               reachable · host=postgres:5432
  [ OK ] Redis                  reachable · host=redis:6379
  [ OK ] Migrations (files)     4 well-formed migration directories
  [ OK ] Migrations (applied)   4/4 applied · none pending
  [ OK ] Seed data              districts=24 roles=13 users=9/9 · flood scenario complete (VALIDATED)
  [ OK ] API/CORS (config)      CLIENT_URL=http://localhost:3000 · PORT=5000
  [ OK ] Health endpoint        200 OK · db=Connected · http://localhost:5000/api/health
  [ OK ] API/CORS (live)        preflight allows http://localhost:3000
  [ OK ] Demo-auth only in dev  production + DEMO_AUTH_ENABLED=true is refused
  [ OK ] Prod requires Firebase production without Firebase credentials is refused
  ────────────────────────────────────────────────────────────
  READY — 11/11 checks passed
```

**What it checks** (each maps to a demo-readiness requirement):

| # | Check | Confirms |
|---|-------|----------|
| 1 | Config | Backend configuration parsed; shows env/port/auth-mode |
| 2 | Database | Postgres reachable (`SELECT 1`) |
| 3 | Redis | Redis reachable (`PING`) |
| 4 | Migrations (files) | Every migration is a well-formed `<name>/migration.sql` — no stray flat `.sql`, no empty dirs |
| 5 | Migrations (applied) | Filesystem migrations match `_prisma_migrations` — none pending |
| 6 | Seed data | 24 districts, 13 roles, 9 demo users, and the full flood scenario exist |
| 7 | Health endpoint | `GET /api/health` returns 200 — the proxy target the frontend uses |
| 8 | API/CORS | `CLIENT_URL`/`PORT` are correct and a live preflight allows the SPA origin |
| 9 | Auth invariants | Demo-auth is refused in production; production requires Firebase |

The output is safe to paste into a chat or ticket: it prints only hosts (which
exclude credentials), booleans, counts, and migration names — **never**
`DATABASE_URL`/`REDIS_URL` contents, Firebase credentials, or any secret value.

### Hermetic tests (no live services)

The backend test suite locks down the failure classes that a live-only check can
miss — migration directory structure, demo-dataset referential integrity, and the
CORS/health/error-envelope HTTP contract. It needs no database, Redis, or Firebase:

```bash
cd backend
npm test
```

---

## Fresh Reset (Empty Database)

To destroy all data and start from a blank database:

```bash
docker compose down -v   # -v removes the postgres/redis volumes
docker compose up --build
```

Migrations and seeds run again automatically.

---

## Demo Auth Tokens

The backend runs in **demo mode** — no Firebase credentials are required. Use these Bearer tokens for API testing. Each token maps to exactly one seeded user and role; the role is derived from the token alone — no `x-demo-role` header exists.

| Token | Role | Notes |
|-------|------|-------|
| `Bearer demo-citizen` | CITIZEN | Submits challenges |
| `Bearer demo-validator` | GOV_VALIDATOR | Validates challenges |
| `Bearer demo-department` | GOV_DEPARTMENT | Prioritizes, matches, deploys |
| `Bearer demo-university` | UNIVERSITY | Accepts/declines university matches |
| `Bearer demo-faculty` | FACULTY | Submits + reviews proposals |
| `Bearer demo-student1` | STUDENT | Submits proposals |
| `Bearer demo-student2` | STUDENT | Submits proposals |
| `Bearer demo-student3` | STUDENT | Submits proposals |
| `Bearer demo-industry` | INDUSTRY + CSR | Submits proposals (dual-role) |

Example — citizen submitting a challenge:

```bash
curl -H "Authorization: Bearer demo-citizen" \
     http://localhost:5000/api/v1/challenges
```

---

## Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Nginx serving the SPA + reverse proxy for `/api/*` |
| Backend  | 5000 | Express API (migrations + seeds run at startup) |
| Postgres | 5432 | PostGIS-enabled Postgres 16 |
| Redis    | 6379 | Cache / queues |

---

## Architecture

```
docker-compose.yml          ← single authoritative Compose file
├── postgres (postgis/postgis:16-3.4)
├── redis (redis:7-alpine)
├── backend
│   ├── Dockerfile
│   └── docker-entrypoint.sh   ← runs: migrate → seeds → start API
└── frontend (Vite + Nginx)
    └── nginx.conf             ← proxies /api/* → backend:5000
```

There is one Compose file at the repository root. The previous `backend/docker-compose.yml` has been removed — do not create additional Compose files.

---

## Reset-and-Seed for Demo Rehearsal

To restore the complete demo state (all 9 demo users, 1 flagship flood challenge with full project data):

```bash
docker compose down -v
docker compose up --build
```

This triggers the full seed pipeline:
1. **Districts & blocks** — 24 Jharkhand districts with block codes
2. **RBAC** — 13 roles, ~24 permissions, role→permission grants, super-admin user
3. **Demo** — 9 demo users + complete flood scenario

### The Flagship Flood Scenario

`flood-ranchi-2026` shows an end-to-end journey:

| Actor | Data |
|-------|------|
| **Citizen** | `demo-citizen` (Riya Devi) submits challenge with 2 photos |
| **Gov Validator** | `demo-validator` validates with on-site note + ward memo |
| **Gov Department** | `demo-department` approves university matching |
| **University Admin** | `demo-university` accepts BITM match |
| **Faculty** | `demo-faculty` mentors student team |
| **Students** | `demo-student1-3` form "FloodWatch BITM" team |
| **Industry/CSR** | `demo-industry` (Tata Steel Foundation) offers ₹5L + 5 sensors |

**Complete workflow data:**
- AI recommendations: UNDERSTAND, PRIORITIZE, MATCH
- Cluster: "Ranchi Urban Drainage"
- Project: "IoT-Based Flood Monitoring & Drainage Optimization"
- Team with roles and skills
- Proposal: approved by government
- Milestones: 4 tracked (sensor deployment → dashboard)
- Collaboration: open funding request to Tata Steel
- Pilot: active 10-sensor deployment
- Deployment: RMC-approved (RMC/Approval/2026/0047)
- Impact records: 2 metrics tracked
- Audit trail: 11 events from submission to deployment
- Comments: 3 threaded interactions

---

## Troubleshooting

**Container exits immediately after "Running Prisma migrations"**
→ The database already has a schema conflict. Run `docker compose down -v` to start fresh.

**"Firebase Admin is not initialized" log warning**
→ Expected in demo mode. The warning appears at startup and is harmless — authentication works via the `Bearer demo-*` bypass.

**Port 5432 already in use**
→ Stop your local Postgres: `docker compose down` then check nothing else is bound to that port.
