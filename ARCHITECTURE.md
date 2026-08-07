# 🏗️ CookMantra — System Architecture, ER Diagram & API Flow Specifications

This document defines the technical architecture, entity-relationship data model, and API interaction flows for the **CookMantra Full-Stack Gourmet Culinary Platform**.

---

## 📌 Table of Contents
1. [System Architecture Diagram](#1-system-architecture-diagram)
2. [Database ER Diagram (Entity-Relationship)](#2-database-er-diagram-entity-relationship)
3. [API Flow Diagrams](#3-api-flow-diagrams)
   - [Authentication & Token Lifecycle Flow](#31-authentication--token-lifecycle-flow)
   - [Chef Booking & Payment Verification Flow](#32-chef-booking--payment-verification-flow)
   - [Admin User Moderation & Revenue Audit Flow](#33-admin-user-moderation--revenue-audit-flow)

---

## 1. System Architecture Diagram

```text
                                  +---------------------------------------+
                                  |         CLIENT BROWSER / SPA          |
                                  |    React 18 + TypeScript + Tailwind   |
                                  +-------------------+-------------------+
                                                      |
                                                      | HTTPS (Port 443 / 8080)
                                                      v
                                  +---------------------------------------+
                                  |         NGINX REVERSE PROXY           |
                                  |   - Gzip Level 6 Compression          |
                                  |   - Security Headers (HSTS, CSP)      |
                                  |   - Static SPA Asset Caching          |
                                  +-------------------+-------------------+
                                                      |
                                          /api/v1/* Proxy Forwarding
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |        EXPRESS REST API SERVER        |
                                  |           (Node.js 20 CJS)            |
                                  |  +---------------------------------+  |
                                  |  | Middleware Chain:               |  |
                                  |  | - RequestID & Morgan Logger     |  |
                                  |  | - Helmet & CORS                 |  |
                                  |  | - Express-Rate-Limit            |  |
                                  |  | - XSS, NoSQL, HPP Sanitizers    |  |
                                  |  | - JWT Cookie/Bearer Auth        |  |
                                  |  +---------------------------------+  |
                                  +---------+-------------------+---------+
                                            |                   |
                           Mongoose Pool    |                   | Redis Socket
                           (Max 50 Conns)   v                   v (Rate-limit/Session)
                                  +-------------------+ +-------------------+
                                  |  MONGODB ATLAS DB | |    REDIS CACHE    |
                                  | (Document Store)  | |  (In-Memory Store)|
                                  +-------------------+ +-------------------+
```

---

## 2. Database ER Diagram (Entity-Relationship)

```text
   +-----------------------+              +-----------------------+
   |         USER          | 1          * |        BOOKING        |
   +-----------------------+--------------+-----------------------+
   | _id (PK)              |              | _id (PK)              |
   | name                  |              | user (FK -> User)     |
   | email (Unique Index)  |              | chefName              |
   | password (bcrypt)     |              | serviceDetail         |
   | phone                 |              | date                  |
   | role (User/Admin/Chef)|              | time                  |
   | addresses []          |              | amount                |
   | isBanned (Boolean)    |              | status (Enum)         |
   | wishlist []           |              | utrNumber             |
   | createdAt             |              | createdAt             |
   +-----------+-----------+              +-----------+-----------+
               | 1                                    | 1
               |                                      |
               | *                                    | 1
   +-----------v-----------+              +-----------v-----------+
   |        REVIEW         |              |        PAYMENT        |
   +-----------------------+              +-----------------------+
   | _id (PK)              |              | _id (PK)              |
   | user (FK -> User)     |              | booking (FK -> Booking)
   | dish (FK -> Dish)     |              | user (FK -> User)     |
   | rating (1..5)         |              | orderId (Razorpay)    |
   | comment               |              | paymentId             |
   | createdAt             |              | amount                |
   +-----------^-----------+              | status (Enum)         |
               | *                        | utrNumber             |
               |                          +-----------------------+
   +-----------+-----------+
   |         DISH          |
   +-----------------------+
   | _id (PK)              |
   | name                  |
   | category              |
   | price                 |
   | description           |
   | image                 |
   | rating                |
   | tags []               |
   +-----------------------+

   +-----------------------+              +-----------------------+
   |        INQUIRY        |              |       AUDIT_LOG       |
   +-----------------------+              +-----------------------+
   | _id (PK)              |              | _id (PK)              |
   | name                  |              | adminId (FK -> User)  |
   | email                 |              | action                |
   | phone                 |              | targetUser            |
   | eventDate             |              | ipAddress             |
   | eventType             |              | timestamp             |
   | guestCount            |              +-----------------------+
   | message               |
   +-----------------------+
```

### Relational Schema Summary & Indexes:
- **`User`**: Indexed on `email` (Unique) and `role`.
- **`Booking`**: Indexed on `user` (FK), `status`, and `date` (Compound Index: `{ user: 1, date: -1 }`).
- **`Dish`**: Indexed on `category` and `name` (Text Search Index).
- **`Payment`**: Indexed on `orderId` and `utrNumber`.
- **`Review`**: Compound Unique Index on `{ user: 1, dish: 1 }` to enforce single review per dish per user.

---

## 3. API Flow Diagrams

### 3.1 Authentication & Token Lifecycle Flow

```text
[ Client Application ]             [ Express Auth API ]             [ MongoDB User Store ]
          |                                 |                                 |
          |--- POST /api/v1/auth/login ---->|                                 |
          |    { email, password }          |--- Find user by email --------->|
          |                                 |<-- Return User Doc (hashed) ----|
          |                                 |                                 |
          |                                 |-- Compare bcrypt hash           |
          |                                 |-- Generate JWT (RS256/HS256)    |
          |                                 |                                 |
          |<-- 200 OK + Token Cookie -------|                                 |
          |    { success, user, token }     |                                 |
          |                                 |                                 |
          |=== Subsequent Authenticated Request ===                           |
          |                                 |                                 |
          |--- GET /api/v1/bookings/my ---->|                                 |
          |    Header: Bearer <token>       |-- Auth Middleware:              |
          |                                 |   Verify JWT signature & expiry |
          |                                 |   Check user.isBanned == false  |
          |                                 |                                 |
          |<-- 200 OK + Bookings JSON ------|<-- Fetch user's bookings -------|
```

### 3.2 Chef Booking & Payment Verification Flow

```text
[ Client App ]              [ Express Booking API ]          [ Razorpay / Bank ]          [ MongoDB ]
      |                                |                             |                         |
      |-- POST /api/v1/bookings ------>|                             |                         |
      |   { chefName, date, amount }   |-- Validate Zod payload      |                         |
      |                                |-- Create 'Pending' booking -+------------------------>|
      |<-- 201 Created (Booking ID) ---|                             |                         |
      |                                                              |                         |
      |-- POST /api/v1/payments/create-order ----------------------->|                         |
      |                                |<-- Return Order Object -----|                         |
      |<-- Order ID + Key ID ----------|                             |                         |
      |                                                              |                         |
      |=== User Completes Gateway / UTR Submission ===               |                         |
      |                                                              |                         |
      |-- POST /api/v1/payments/verify ----------------------------->|                         |
      |   { orderId, paymentId, sig }  |-- Verify HMAC SHA256 Sig    |                         |
      |                                |-- Update Booking status 'Confirmed' ----------------->|
      |<-- 200 OK (Verification Success)                            |                         |
```

### 3.3 Admin User Moderation & Revenue Audit Flow

```text
[ Admin Dashboard ]              [ Express Admin API ]           [ Security Audit Logger ]    [ MongoDB ]
         |                                 |                                 |                    |
         |--- GET /api/v1/admin/stats ---->|                                 |                    |
         |    Header: Bearer <adminToken>  |-- Verify Role == 'Admin'        |                    |
         |<-- 200 OK (Revenue Stats) ------|<-- Aggregate Bookings/Users ----+------------------->|
         |                                 |                                 |                    |
         |--- PATCH /admin/users/:id/ban ->|                                 |                    |
         |                                 |-- Update user isBanned = true --+------------------->|
         |                                 |-- Write Security Audit Log ---->|                    |
         |<-- 200 OK (User Banned) --------|   [Admin: ban_user, IP, Time]   |                    |
```
