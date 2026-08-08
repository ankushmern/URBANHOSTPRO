# 🍳 CookMantra — Production-Grade MERN Gourmet Culinary Service & Booking Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN%20(MongoDB%2C%20Express%2C%20React%2C%20Node)-emerald)](https://github.com)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed)](docker-compose.yml)
[![License](https://img.shields.io/badge/License-MIT-orange)](LICENSE)

**CookMantra** is an enterprise-grade, full-stack MERN application crafted for personal chef bookings, gourmet dish orders, weekly meal prep subscriptions, and culinary masterclass reservations. It features secure JWT authentication, Razorpay & UPI payment verification, real-time booking status workflows, administrative controls, cursor-based pagination, and Docker containerized deployment infrastructure.

---

## 📌 Table of Contents
- [Project Overview](#-project-overview)
- [Application Screenshots & Visual UI Layouts](#-application-screenshots--visual-ui-layouts)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Folder Structure](#-project-folder-structure)
- [Installation Guide](#-installation-guide)
- [Environment Variables](#-environment-variables)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Authentication Flow](#-authentication-flow)
- [Database Schema Overview](#-database-schema-overview)
- [Running Locally](#-running-locally)
- [Production Build & Docker](#-production-build--docker)
- [Troubleshooting](#-troubleshooting)
- [Documentation Index](#-documentation-index)

---

## 🌟 Project Overview

CookMantra bridges food lovers with elite culinary professionals. Users can explore handcrafted menus, customize dietary preferences, book private dining chefs, manage weekly meal plans, download PDF invoices, and monitor booking status in real time. Administrators enjoy live revenue analytics, user ban/unban moderation, dish catalog management, and audit logging.

---

## 📸 Application Screenshots & Visual UI Layouts

Below are the architectural layouts and visual UI specs of CookMantra's key application views:

### 1. Home Page Hero & Master Chef Reservation Canvas
```text
+-----------------------------------------------------------------------------------------+
| [CookMantra Logo]   Services   Gourmet Menu   Weekly Prep   Masterclass   [Book Chef]  |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   EXPERIENCE PRIVATE GOURMET CULINARY DINING AT HOME                                    |
|   Elevate your dining with Michelin-trained private chefs and tailored menus.           |
|                                                                                         |
|   [ 📅 Select Date: 2026-08-15 ] [ 🕒 Select Time: 19:30 ] [ 👥 Guests: 4 ]             |
|   [  SEARCH AVAILABLE CHEFS & MENUS  ]                                                  |
|                                                                                         |
|   +-----------------------+ +-----------------------+ +-----------------------+         |
|   | Chef Sanjeev Kapoor   | | Master Chef Vikas     | | Chef Ranveer Brar     |         |
|   | ★ 4.9 (120 reviews)   | | ★ 4.95 (210 reviews)  | | ★ 4.88 (95 reviews)   |         |
|   | Specialty: North Ind. | | Specialty: Royal Ind. | | Specialty: Fusion     |         |
|   | [ Book Experience ]   | | [ Book Experience ]   | | [ Book Experience ]   |         |
|   +-----------------------+ +-----------------------+ +-----------------------+         |
+-----------------------------------------------------------------------------------------+
```

### 2. Gourmet Dish Catalog & Dietary Preference Filter
```text
+-----------------------------------------------------------------------------------------+
|  Categories:  [All]  [Starters]  [Main Course]  [Desserts]  [High Protein]  [Keto]       |
|  Search: [🔍 Search truffle butter, paneer tikka, biryani...                   ]        |
+-----------------------------------------------------------------------------------------+
|  +---------------------------+ +---------------------------+ +-----------------------+ |
|  | Truffle Dal Makhani       | | Saffron Biryani Deluxe    | | Avocado Shahi Halwa   | |
|  | ★ 4.9 (48 ratings)        | | ★ 4.95 (82 ratings)       | | ★ 4.8 (34 ratings)    | |
|  | Slow-cooked 24hr simmered | | Organic basmati & spices | | Sugar-free almond milk| |
|  | ₹ 699   [ Add to Cart ]   | | ₹ 899   [ Add to Cart ]   | | ₹ 499   [ Add to Cart ]| |
|  +---------------------------+ +---------------------------+ +-----------------------+ |
+-----------------------------------------------------------------------------------------+
```

### 3. Admin Control Center & Revenue Analytics
```text
+-----------------------------------------------------------------------------------------+
| ADMIN CONTROL CENTER                                            [ Export CSV ] [ Logs ] |
+-----------------------------------------------------------------------------------------+
| [ Total Revenue: ₹1,48,500 ]  [ Active Bookings: 42 ]  [ Registered Users: 128 ]        |
+-----------------------------------------------------------------------------------------+
| RECENT BOOKINGS & VERIFICATION QUEUE                                                     |
| User         | Chef Name          | Service              | Status      | Action         |
| ------------ | ------------------ | -------------------- | ----------- | -------------- |
| Eren Yeager  | Master Chef Vikas  | Royal Private Dining | Confirmed   | [ View ]       |
| Mikasa A.    | Chef Sanjeev K.    | Weekly Prep Plan     | Pending UTR | [ Verify UTR ] |
| Armin A.     | Chef Ranveer Brar  | Masterclass Session  | Completed   | [ Invoice ]    |
+-----------------------------------------------------------------------------------------+
```

---

## ✨ Key Features

- **🛡️ JWT Authentication & Security**: Dual-token strategy with HTTP-only cookies, password hashing (bcrypt), and role-based access control (RBAC).
- **💳 Payment Integration**: Native Razorpay gateway with order verification, webhook listeners, and fallback UTR bank verification.
- **📅 Real-Time Booking Engine**: Instant chef assignment, calendar scheduling, status progression (`Pending` ➔ `Confirmed` ➔ `In Progress` ➔ `Completed`).
- **👑 Comprehensive Admin Dashboard**: Live revenue analytics, order status management, dish catalog editor, user ban/unban moderation, and system audit logs.
- **💬 Reviews & Inquiries**: Dish rating and review submissions with moderation, along with event catering contact forms.
- **📜 Invoice & Export Engine**: Automatic PDF receipt generation (`jsPDF` + `html2canvas`) and CSV booking data export.
- **🐳 Enterprise DevOps**: Multi-stage Docker containers, Nginx reverse proxy with security headers, Gzip compression, and GitHub Actions CI/CD.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18+ (Vite SPA)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4, Motion (Animations)
- **Icons**: Lucide React
- **Exporting**: jsPDF, html2canvas

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose 8) & In-Memory Hybrid Store
- **Caching & Sessions**: Redis (Optional)
- **Security**: Helmet, CORS, Express-Rate-Limit, Zod Validation, XSS/NoSQL Sanitizer
- **Bundler**: ESBuild (Bundled to CommonJS `dist/server.cjs`)

### DevOps & Infrastructure
- **Containerization**: Docker, Docker Compose
- **Web Server / Reverse Proxy**: Nginx 1.27 Alpine
- **CI/CD**: GitHub Actions

---

## 📂 Project Folder Structure

```text
cookmantra/
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions CI/CD Pipeline
├── nginx/
│   ├── nginx.conf                # Main Nginx Worker & Compression Config
│   └── default.conf              # Reverse Proxy, SSL, & Security Headers
├── scripts/
│   ├── backup-db.sh              # Automated MongoDB Backup Script
│   ├── restore-db.sh             # MongoDB Restoration Utility
│   ├── deploy.sh                 # Zero-Downtime Deployment Script
│   └── start-prod.sh             # Production Entry Point Script
├── server/
│   ├── config/                   # Database (Mongoose) & Zod Env Validation
│   ├── controllers/              # Auth, User, Booking, Payment, Admin, Review Controllers
│   ├── middleware/               # Auth, Error, Rate Limiter, Request ID, Sanitizers
│   ├── models/                   # Mongoose Schemas (User, Booking, Dish, Payment, etc.)
│   ├── routes/                   # Express API Routers
│   ├── services/                 # Business Logic & Database Monitor Services
│   ├── utils/                    # Logger (Winston), AppError, DB Transactions
│   └── validators/               # Zod Input Schema Definitions
├── src/
│   ├── components/               # React Components (Modals, Nav, Sections)
│   ├── context/                  # React Auth & Theme Context Providers
│   ├── data/                     # Initial Gourmet Menu Datasets
│   ├── types.ts                  # Shared Frontend & API Type Definitions
│   ├── App.tsx                   # Main React App Router & State Container
│   └── main.tsx                  # React DOM Root Mount
├── Dockerfile                    # Fullstack Production Container Build
├── Dockerfile.backend            # Node.js Backend Microservice Build
├── Dockerfile.frontend           # Nginx Frontend SPA Container Build
├── docker-compose.yml            # Container Orchestration (Backend, Frontend, Mongo, Redis)
├── vite.config.ts                # Vite Bundler & Code-Splitting Configuration
├── package.json                  # Dependencies & npm scripts
└── server.ts                     # Express Server Entry Point & Middleware Chain
```

---

## ⚙️ Environment Variables

Create a `.env` or `.env.development` file in the project root:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database & Cache
MONGODB_URI=mongodb://127.0.0.1:27017/cookmantra
REDIS_URI=redis://127.0.0.1:6379

# Security Secrets
JWT_SECRET=cookmantra_super_secure_jwt_secret_key_2026

# Payment Gateway (Razorpay Sandbox/Live)
RAZORPAY_KEY_ID=rzp_test_cookmantra2026
RAZORPAY_KEY_SECRET=secret_cookmantra_test_key_9988
RAZORPAY_WEBHOOK_SECRET=whsec_cookmantra_webhook_secret

# AI Features (Optional)
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🔌 API Endpoints Overview

| Module | Method | Endpoint | Access | Description |
|--------|--------|----------|--------|-------------|
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Register a new user |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | User login & JWT issuance |
| **Auth** | `GET` | `/api/v1/auth/me` | Protected | Fetch current logged-in profile |
| **User** | `GET` | `/api/v1/user/profile` | Protected | Retrieve full user details |
| **User** | `PUT` | `/api/v1/user/profile` | Protected | Update profile & contact info |
| **Bookings** | `GET` | `/api/v1/bookings/my` | Protected | Retrieve user's bookings |
| **Bookings** | `POST` | `/api/v1/bookings` | Protected | Create a new culinary booking |
| **Payments** | `POST` | `/api/v1/payments/create-order` | Protected | Initiate Razorpay order |
| **Payments** | `POST` | `/api/v1/payments/verify` | Protected | Verify Razorpay signature |
| **Admin** | `GET` | `/api/v1/admin/stats` | Admin | Overall revenue & system analytics |
| **Admin** | `GET` | `/api/v1/admin/users` | Admin | List and moderate all users |
| **Health** | `GET` | `/api/health/extended` | Public | Memory, CPU, DB system health |

*For complete endpoint documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).*

---

## 🔐 Authentication Flow

```
[ User ] ────( POST /auth/login )────► [ Express Server ]
                                              │
                                   Verify Password Hashing (bcrypt)
                                              │
[ User ] ◄───( JWT Token + Cookie )───────────┘
   │
   ├─► Attach Header: `Authorization: Bearer <token>`
   └─► Access Protected Routes (`/api/v1/bookings/my`, `/api/v1/user/profile`)
```

---

## 🗄️ Database Schema Overview

CookMantra utilizes Mongoose models defined in `/server/models`:
1. **User Schema**: `name`, `email`, `password`, `phone`, `role` (`User` | `Admin` | `Chef`), `addresses`, `isBanned`, `wishlist`.
2. **Booking Schema**: `user`, `serviceDetail`, `chefName`, `date`, `time`, `amount`, `status` (`Pending Bank Verification` | `Confirmed` | `Completed` | `Cancelled`), `utrNumber`.
3. **Dish Schema**: `name`, `category`, `price`, `description`, `image`, `rating`, `tags`.
4. **Payment Schema**: `orderId`, `paymentId`, `amount`, `status`, `user`, `utrNumber`.
5. **Review Schema**: `user`, `dish`, `rating`, `comment`, `createdAt`.
6. **Inquiry Schema**: `name`, `email`, `phone`, `eventDate`, `eventType`, `guestCount`, `message`.

---

## 🚀 Running Locally

### Prerequisites
- **Node.js**: `v18+` or `v20+`
- **npm**: `v9+`
- **MongoDB**: Local running instance or MongoDB Atlas URI

### Steps
1. **Clone repository**:
   ```bash
   git clone https://github.com/cookmantra/cookmantra-app.git
   cd cookmantra-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment**:
   ```bash
   cp .env.example .env
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Access application at `http://localhost:3000`.

---

## 🐳 Production Build & Docker

### 1. Standalone Production Build
```bash
npm run build
npm start
```

### 2. Docker Compose Launch
```bash
# Spin up all containers (Frontend Nginx, Express Backend, MongoDB, Redis)
docker-compose up -d --build
```

Access the Nginx frontend at `http://localhost:8080` and the Express API at `http://localhost:3000`.

---

## 🔧 Troubleshooting

- **MongoDB Connection Warning**: Ensure `MONGODB_URI` is correctly specified in `.env`. CookMantra will seamlessly use its in-memory fallback store if MongoDB is offline during initial startup.
- **Port 3000 in use**: Ensure no other background process is occupying port 3000 before running `npm run dev`.
- **JWT Authorization Error**: Verify that the `Authorization: Bearer <token>` header is present or HTTP-only cookies are enabled in browser requests.

---

## 📖 Documentation Index

- 🏗️ [**System Architecture & ER Diagrams (ARCHITECTURE.md)**](./ARCHITECTURE.md)
- 🔌 [**API Reference Guide (API_DOCUMENTATION.md)**](./API_DOCUMENTATION.md)
- 🛡️ [**Security & Threat Model Report (SECURITY_REPORT.md)**](./SECURITY_REPORT.md)
- ⚡ [**Performance & Optimization Report (PERFORMANCE_REPORT.md)**](./PERFORMANCE_REPORT.md)
- 🧪 [**Test Coverage & Verification Report (TEST_COVERAGE_REPORT.md)**](./TEST_COVERAGE_REPORT.md)
- ⚙️ [**Environment Setup Guide (ENVIRONMENT_SETUP.md)**](./ENVIRONMENT_SETUP.md)
- 💻 [**Installation Guide (INSTALLATION.md)**](./INSTALLATION.md)
- 🚀 [**Deployment Guide (DEPLOYMENT_GUIDE.md)**](./DEPLOYMENT_GUIDE.md)
- 📑 [**Production Readiness Audit (PRODUCTION_READINESS_REPORT.md)**](./PRODUCTION_READINESS_REPORT.md)
- 📊 [**Final Production Audit Sign-Off (FINAL_AUDIT_REPORT.md)**](./FINAL_AUDIT_REPORT.md)
- 🐛 [**Known Issues & Resolutions (KNOWN_ISSUES.md)**](./KNOWN_ISSUES.md)
- 🔮 [**Future Enhancements Roadmap (FUTURE_IMPROVEMENTS.md)**](./FUTURE_IMPROVEMENTS.md)
- 🤝 [**Contributing Guidelines (CONTRIBUTING.md)**](./CONTRIBUTING.md)
- 📜 [**Changelog & Release History (CHANGELOG.md)**](./CHANGELOG.md)
- 📄 [**License (LICENSE)**](./LICENSE)

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for full details.
#   u r b a n h o s t p r o  
 