# 🏗️ CookMantra Infrastructure & Architecture Diagram

This document presents the visual topology and containerized architecture of the **CookMantra Production Infrastructure**.

---

## 1. High-Level System Architecture Topology

```
                                  [ Client Browser / Mobile Web ]
                                                │
                                                │ HTTPS (Port 443)
                                                ▼
                             ┌──────────────────────────────────────┐
                             │       Nginx Reverse Proxy / SPA      │
                             │        (Port 80 / Port 8080)         │
                             └──────────────────┬───────────────────┘
                                                │
                                    /api/* Proxy Forwarding
                                                │
                                                ▼
                             ┌──────────────────────────────────────┐
                             │     CookMantra Node.js Express API   │
                             │           (Port 3000)                │
                             └──────┬───────────────────────┬───────┘
                                    │                       │
                     Mongoose Pool  │                       │  Redis Client
                    (Max 50 Conns)  ▼                       ▼
                        ┌───────────────────────┐   ┌───────────────────────┐
                        │    MongoDB Database   │   │  Redis Cache/Sessions │
                        │      (Port 27017)     │   │      (Port 6379)      │
                        └───────────────────────┘   └───────────────────────┘
```

---

## 2. Docker Container Communication Network Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Bridge Network: cookmantra-net                                                          │
│                                                                                        │
│   ┌──────────────────────────┐             ┌──────────────────────────┐                 │
│   │   cookmantra-frontend    │             │    cookmantra-backend    │                 │
│   │   (Nginx 1.27 Alpine)    ├────────────►│   (Node 20 Alpine CJS)   │                 │
│   │   Serves Dist Static SPA │  /api/*     │   Express REST API App   │                 │
│   └─────────────┬────────────┘             └──────┬────────────┬──────┘                 │
│                 │                                 │            │                        │
│                 │ Static                          │ TCP        │ TCP                    │
│                 ▼                                 ▼            ▼                        │
│             [ Users ]                     ┌──────────────┐  ┌──────────────┐            │
│                                           │  cookmantra  │  │  cookmantra  │            │
│                                           │    -mongo    │  │    -redis    │            │
│                                           │ (Mongo 7.0)  │  │  (Redis 7)   │            │
│                                           └──────┬───────┘  └──────┬───────┘            │
│                                                  │                 │                    │
└──────────────────────────────────────────────────┼─────────────────┼────────────────────┘
                                                   ▼                 ▼
                                         [ mongodb_data ]     [ redis_data ]
                                         (Docker Volume)     (Docker Volume)
```

---

## 3. Detailed Component Breakdown

### A. Reverse Proxy & Frontend SPA (`cookmantra-frontend`)
- **Image**: `nginx:1.27-alpine`
- **Role**: Serves optimized static assets produced by Vite (`dist/`), handles client-side routing, and proxies `/api/*` endpoints to the backend container.
- **Security**: Applies HTTP Strict Transport Security (HSTS), Content Security Policy (CSP), X-Frame-Options, and X-Content-Type-Options.
- **Optimization**: Enables Gzip level 6 compression for all static assets and API responses.

### B. Core Application Server (`cookmantra-backend`)
- **Image**: `node:20-alpine` (Custom multi-stage build)
- **Role**: Hosts the compiled CommonJS Express backend (`dist/server.cjs`).
- **Middleware Chain**:
  1. `requestIdMiddleware` (Assigns unique UUID to every request)
  2. `morganStream` (Winston-backed HTTP logging)
  3. `helmet` (Security headers)
  4. `cors` (Domain origin filtering)
  5. `apiLimiter` (15-minute rate-limiting window)
  6. `nosqlSanitizer`, `xssSanitizer`, `hppSanitizer`, `csrfProtection`
- **Health Checks**: Exposes `/api/health`, `/api/health/extended`, `/api/health/db`, and `/api/metrics`.

### C. Persistent Storage Layer (`cookmantra-mongo`)
- **Image**: `mongo:7.0-noble`
- **Role**: Document storage for Users, Bookings, Dishes, Payments, Reviews, Inquiries, and Audit Logs.
- **Features**: Connection pooling (up to 50 concurrent sockets), automated retry strategy, and volume persistence via `mongodb_data`.

### D. Memory Caching Layer (`cookmantra-redis`)
- **Image**: `redis:7-alpine`
- **Role**: In-memory storage for high-frequency queries, rate-limit buckets, and session state.

---

## 4. Continuous Integration & CD Workflow

```
[ Git Push / Pull Request ]
            │
            ▼
┌───────────────────────────────┐
│     GitHub Actions Workflow   │
├───────────────────────────────┤
│ 1. Setup Node.js 20           │
│ 2. npm ci (Dependencies)      │
│ 3. npm run lint (Type check)  │
│ 4. npm run build              │
│ 5. Docker Build Verification  │
└───────────────┬───────────────┘
                │
                ▼
  [ Production Ready Release ]
```
