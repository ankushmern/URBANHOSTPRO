# 🚀 CookMantra Production Deployment Guide

This guide provides step-by-step instructions for deploying, scaling, and maintaining the **CookMantra Full-Stack Application** in a production environment using Docker, Nginx, MongoDB Atlas, and Redis.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Environment Configuration](#2-environment-configuration)
3. [Docker & Container Orchestration](#3-docker--container-orchestration)
4. [Nginx Reverse Proxy & SSL Setup](#4-nginx-reverse-proxy--ssl-setup)
5. [MongoDB Atlas Setup & Connection Pooling](#5-mongodb-atlas-setup--connection-pooling)
6. [Database Backup & Restoration](#6-database-backup--restoration)
7. [Health Checks & System Monitoring](#7-health-checks--system-monitoring)
8. [Continuous Integration & Deployment (CI/CD)](#8-continuous-integration--deployment-cicd)

---

## 1. Prerequisites

Ensure the deployment host server (Ubuntu 22.04 LTS or Cloud Compute Instance) has the following installed:
- **Docker Engine**: v24.0+
- **Docker Compose**: v2.20+
- **Git**: v2.34+
- **Domain Name**: Configured with DNS `A` records pointing to your server's public IP address.

---

## 2. Environment Configuration

1. Clone the repository on your production host:
   ```bash
   git clone https://github.com/cookmantra/cookmantra-app.git /var/www/cookmantra
   cd /var/www/cookmantra
   ```

2. Create `.env.production` from the template:
   ```bash
   cp .env.production .env
   ```

3. Update `.env` with production secrets:
   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb+srv://<db_user>:<db_password>@cookmantra-prod.mongodb.net/cookmantra?retryWrites=true&w=majority
   REDIS_URI=redis://redis:6379
   JWT_SECRET=production_random_64_character_hex_string
   RAZORPAY_KEY_ID=rzp_live_your_actual_key_id
   RAZORPAY_KEY_SECRET=your_actual_live_secret
   RAZORPAY_WEBHOOK_SECRET=your_actual_live_webhook_secret
   GEMINI_API_KEY=your_production_gemini_api_key
   ```

---

## 3. Docker & Container Orchestration

Run the automated deployment script to build images and spin up containers:

```bash
chmod +x scripts/*.sh
./scripts/deploy.sh
```

Or execute via Docker Compose manually:

```bash
# Build production images
docker-compose build --parallel

# Start MongoDB & Redis containers
docker-compose up -d mongodb redis

# Start Backend API & Frontend Nginx containers
docker-compose up -d backend frontend
```

### Container Port Allocation
| Service | Internal Port | External Host Port | Protocol | Description |
|---------|---------------|-------------------|----------|-------------|
| **Frontend** | `80` | `8080` / `80` | HTTP | Nginx Static SPA |
| **Backend** | `3000` | `3000` | HTTP | Node.js Express API |
| **MongoDB** | `27017` | `27017` | TCP | Primary Database |
| **Redis** | `6379` | `6379` | TCP | Session & Rate Limit Cache |

---

## 4. Nginx Reverse Proxy & SSL Setup

### SSL Certificate via Certbot (Let's Encrypt)
To enable HTTPS for domain `cookmantra.com`:

```bash
sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cookmantra.com -d www.cookmantra.com
```

### Nginx Configuration Highlights (`nginx/default.conf`)
- **Gzip Compression**: Compresses HTML, JS, CSS, JSON, and SVG assets (Level 6).
- **Security Headers**: Includes `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`, and `Strict-Transport-Security`.
- **Static Asset Caching**: 1-year immutable caching for static bundle assets.
- **API Reverse Proxy**: Routes `/api/*` traffic cleanly to backend container port `3000`.

---

## 5. MongoDB Atlas Setup & Connection Pooling

CookMantra uses Mongoose with automated connection pooling and failover recovery tuned in `/server/config/db.ts`:

- **Production Pool Size**: `maxPoolSize: 50`, `minPoolSize: 10`.
- **Timeout Thresholds**: `serverSelectionTimeoutMS: 10000`, `socketTimeoutMS: 45000`.
- **Automatic Reconnection**: Re-establishes connectivity automatically upon network drops without crashing the server.

---

## 6. Database Backup & Restoration

### Automated Daily Backup Execution
Run a manual backup or trigger via cron:

```bash
./scripts/backup-db.sh
```

To configure daily automated cron backups at 02:00 AM:
```bash
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/cookmantra/scripts/backup-db.sh >> /var/log/cookmantra-backup.log 2>&1") | crontab -
```

### Database Restoration Procedure
To restore MongoDB from a backup snapshot:

```bash
./scripts/restore-db.sh ./backups/cookmantra_backup_YYYYMMDD_HHMMSS
```

---

## 7. Health Checks & System Monitoring

CookMantra provides real-time monitoring endpoints for system health and observability:

- **Basic Health Ping**: `GET /api/health`
- **Extended System Diagnostics**: `GET /api/health/extended` (Returns RSS Memory, CPU Load, Uptime, and DB Connection State)
- **Database Diagnostic Report**: `GET /api/health/db` (Returns collection stats, soft-deleted document ratios, and index counts)
- **System Metrics**: `GET /api/metrics` (Prometheus / JSON metric feeds)

---

## 8. Continuous Integration & Deployment (CI/CD)

The GitHub Actions workflow in `.github/workflows/ci-cd.yml` automatically triggers on `push` or `pull_request` to `main` / `develop`:

1. **Lint & Type Check**: Validates TypeScript type safety and ESLint rules.
2. **Build Verification**: Builds Vite frontend assets and ESBuild backend server bundle.
3. **Docker Build Verification**: Validates `Dockerfile.backend` and `Dockerfile.frontend` builds.
