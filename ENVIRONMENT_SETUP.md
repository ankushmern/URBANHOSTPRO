# ⚙️ CookMantra — Environment Setup & Configuration Guide

This guide details the environment configuration requirements, variable definitions, and security guidelines for **CookMantra**.

---

## 📌 Environment Files Overview

CookMantra supports three distinct environment contexts:

| File Name | Purpose | Target Environment |
|-----------|---------|-------------------|
| `.env.example` | Template containing all required keys without real secrets | Public / Version Control |
| `.env.development` | Local development settings (Local MongoDB, test keys) | Local Developer Machines |
| `.env.production` | Production settings (MongoDB Atlas, SSL, Live Keys) | Production / Cloud Run |

---

## 🔑 Environment Variables Specification

### 1. Application & Server Settings
| Variable Name | Required | Default Value | Description |
|---------------|----------|---------------|-------------|
| `NODE_ENV` | Yes | `development` | Runtime mode: `development`, `production`, or `test`. |
| `PORT` | Yes | `3000` | HTTP port for the Express server. |

### 2. Database & Cache
| Variable Name | Required | Default Value | Description |
|---------------|----------|---------------|-------------|
| `MONGODB_URI` | Yes | `mongodb://127.0.0.1:27017/cookmantra` | MongoDB connection URI string. |
| `REDIS_URI` | Optional | `redis://127.0.0.1:6379` | Redis connection URI string for session caching. |

### 3. Authentication & Security
| Variable Name | Required | Default Value | Description |
|---------------|----------|---------------|-------------|
| `JWT_SECRET` | Yes | `cookmantra_jwt_secret_dev_2026` | Secret key used to sign and verify JWT tokens (min 8 chars). |
| `JWT_EXPIRES_IN` | No | `30d` | JWT token validity lifespan (e.g., `1d`, `7d`, `30d`). |

### 4. Razorpay Payment Gateway
| Variable Name | Required | Default Value | Description |
|---------------|----------|---------------|-------------|
| `RAZORPAY_KEY_ID` | Yes | `rzp_test_cookmantra2026` | Razorpay Key ID (Test or Live). |
| `RAZORPAY_KEY_SECRET` | Yes | `secret_cookmantra_test_key` | Razorpay Key Secret (Test or Live). |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | `whsec_cookmantra_webhook` | Webhook verification secret for Razorpay callbacks. |

### 5. External AI Integrations
| Variable Name | Required | Default Value | Description |
|---------------|----------|---------------|-------------|
| `GEMINI_API_KEY` | Optional | `MY_GEMINI_API_KEY` | Google Gemini API Key for AI dish suggestions. |

---

## 🛡️ Runtime Validation Engine

CookMantra automatically validates environment configuration on server startup using **Zod** in `/server/config/env.ts`.

- If required variables are missing or malformed in `development`, warnings are logged to the console.
- In `production`, if mandatory variables fail validation, the application safely halts execution to prevent insecure startups:

```typescript
// server/config/env.ts snippet
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
  // ...
});
```

---

## 🔐 Best Practices for Production Secrets

1. **Never commit `.env` or `.env.production`** to Git repositories.
2. Generate strong 64-character random strings for `JWT_SECRET` in production:
   ```bash
   openssl rand -hex 32
   ```
3. Use MongoDB Atlas connection string with `retryWrites=true&w=majority` enabled for high availability.
4. Keep Razorpay test credentials separate from production live credentials.
