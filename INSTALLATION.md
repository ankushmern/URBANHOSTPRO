# 💻 CookMantra — Step-by-Step Installation Guide

This document provides complete installation instructions for setting up **CookMantra** locally or inside Docker containers.

---

## 📋 Prerequisites

Before installing, ensure your environment meets the following minimum requirements:

| Tool | Version Requirement | Purpose |
|------|--------------------|---------|
| **Node.js** | `v18.0.0` or `v20.0.0`+ | JavaScript runtime for frontend & Express server |
| **npm** | `v9.0.0`+ | Package manager |
| **MongoDB** | `v6.0`+ or MongoDB Atlas | Primary database |
| **Docker & Compose** | `v24.0`+ / `v2.20`+ *(Optional)* | Containerized execution |
| **Git** | `v2.30`+ | Version control |

---

## 🚀 Option A: Local Bare-Metal Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/cookmantra/cookmantra-app.git
cd cookmantra-app
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
Edit `.env` and configure your local MongoDB connection string and JWT secret:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/cookmantra
JWT_SECRET=my_development_secret_key_2026
```

### Step 4: Start MongoDB Service
Ensure MongoDB is running locally:
```bash
# Ubuntu / Debian
sudo systemctl start mongod

# macOS (Homebrew)
brew services start mongodb-community
```

### Step 5: Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:3000`. Navigate to this URL in your web browser.

---

## 🐳 Option B: Docker Container Setup

If you prefer to run CookMantra inside Docker containers (including MongoDB and Redis):

### Step 1: Build & Launch Containers
```bash
docker-compose up -d --build
```

### Step 2: Verify Running Services
```bash
docker-compose ps
```

Expected output:
- `cookmantra-frontend` running on port `8080`
- `cookmantra-backend` running on port `3000`
- `cookmantra-mongo` running on port `27017`
- `cookmantra-redis` running on port `6379`

### Step 3: Access Application
- **Frontend App**: `http://localhost:8080`
- **Backend API**: `http://localhost:3000/api/v1`
- **Health Check**: `http://localhost:3000/api/health`

---

## 🧑‍💻 Default Seed Credentials

Upon startup, the server seeds an initial default admin account if none exists:

- **Admin Email**: `admin@cookmantra.com`
- **Admin Password**: `AdminPass123!`
- **Role**: `Admin`

---

## 🧪 Post-Installation Verification

Run the project linter and type-checker to confirm code integrity:
```bash
npm run lint
```

Build the production bundle to verify compilation:
```bash
npm run build
```
