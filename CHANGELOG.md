# 📜 CookMantra — Changelog & Release History

All notable changes to the **CookMantra** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-05

### 🎉 Initial Production Release

#### Added
- **Authentication & Security**:
  - JWT authentication with dual token support (Bearer header + HTTP-only cookies).
  - Password hashing via `bcryptjs`.
  - Role-Based Access Control (RBAC) supporting `User`, `Admin`, and `Chef` roles.
  - Zod runtime request body schema validation.
  - NoSQL injection, XSS, and HPP request sanitization middleware.
  - Rate limiting on authentication and API routes.

- **Core Culinary Services & Booking Engine**:
  - Personal chef reservation engine with instant calendar date/time selection.
  - Gourmet dish menu browser with category filtering and real-time search.
  - Weekly meal prep subscription selector (Standard, High Protein, Gourmet Keto).
  - Booking status state machine (`Pending Bank Verification` ➔ `Confirmed` ➔ `In Progress` ➔ `Completed` / `Cancelled`).
  - Native PDF invoice generation (`jsPDF` + `html2canvas`).

- **Payment & Banking System**:
  - Razorpay order creation and signature verification.
  - Manual UPI QR code & UTR bank reference submission workflow.
  - Admin payment verification & auto-rejection mechanism.

- **Admin Control Center**:
  - Real-time revenue analytics dashboard.
  - User management suite with ban/unban moderation controls and role assignment.
  - Dish catalog management (Add, edit, delete dishes).
  - System audit logs and database diagnostic reporting endpoints.

- **DevOps & Infrastructure**:
  - Multi-stage Dockerfiles (`Dockerfile.backend`, `Dockerfile.frontend`, `Dockerfile`).
  - Docker Compose configuration for Backend, Frontend, MongoDB, and Redis.
  - Nginx reverse proxy configuration with Gzip compression and security headers.
  - GitHub Actions CI/CD pipeline (`.github/workflows/ci-cd.yml`).
  - Automated database backup and restore shell scripts (`backup-db.sh`, `restore-db.sh`).
  - Extended system health monitoring API (`/api/health/extended`, `/api/health/db`).

- **Comprehensive Documentation**:
  - Professional `README.md`, `API_DOCUMENTATION.md`, `ENVIRONMENT_SETUP.md`, `INSTALLATION.md`, `DEPLOYMENT_GUIDE.md`, `INFRASTRUCTURE_DIAGRAM.md`, `PRODUCTION_READINESS_REPORT.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, and `LICENSE`.
