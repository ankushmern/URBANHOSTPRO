# 🏗️ CookMantra — Database Schema & Architecture Guide

---

## 📐 System Architecture Diagram

```text
  ┌─────────────────────────────────────────────────────────┐
  │                    React 18 Frontend                    │
  │     (Dashboard, Dishes, Admin Panel, Payment Modal)     │
  └────────────────────────────┬────────────────────────────┘
                               │ HTTP REST Requests
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │                   Express.js API Server                 │
  │   - Auth Middleware (JWT Token Validator)              │
  │   - Validation Middleware (Payload Sanitization)       │
  │   - Error Handler & Router                             │
  └────────────────────────────┬────────────────────────────┘
                               │ Mongoose Driver Queries
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │                   MongoDB Database                       │
  │   - Users Collection                                    │
  │   - Bookings Collection                                 │
  │   - Dishes Collection                                   │
  │   - Inquiries Collection                                │
  └─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Collections & Mongoose Schemas

### 1. `Users` Collection
Stores registered client and admin user credentials and profiles.
```typescript
interface UserSchema {
  _id: ObjectId;
  name: string;          // required
  email: string;         // required, unique, indexed
  password: string;      // required (hashed with bcrypt)
  phone: string;         // optional
  role: 'User' | 'Chef' | 'Admin'; // default: 'User'
  status: 'Active' | 'Banned';     // default: 'Active'
  address?: {
    street: string;
    city: string;
    zipCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. `Bookings` Collection
Stores order reservations and payment UTR status details.
```typescript
interface BookingSchema {
  _id: ObjectId;
  userId: ObjectId;      // reference to Users collection
  chefName: string;      // required
  serviceDetail: string; // required (e.g. "CookMantra ₹9 Special Gourmet Trial Dish [Qty: 2]")
  date: string;          // YYYY-MM-DD
  time: string;          // HH:mm
  address: string;       // service address
  name: string;          // client contact name
  phone: string;         // client contact phone
  amount: number;        // total booking amount in INR
  status: 'Pending Bank Verification' | 'Confirmed' | 'Payment Failed';
  utrNumber?: string;    // 12-digit bank UPI transaction reference
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. `Dishes` Collection
Stores menu catalog items available for browsing and booking.
```typescript
interface DishSchema {
  _id: ObjectId;
  title: string;         // required
  category: 'Main Course' | 'Starters' | 'Drinks' | 'Desserts' | 'Masterclass';
  price: number;         // INR price
  prepTime: string;      // e.g. "30 mins"
  rating: number;        // 1.0 - 5.0
  image: string;         // image URL string
  description: string;   // detailed dish description
  tags: string[];        // e.g. ["Chef Special", "Spicy"]
  createdAt: Date;
}
```

---

## 🔄 End-to-End Real-Time Payment & Order Workflow

1. **Order Creation**: Client selects a dish or chef service ➔ completes details in `BookingModal` ➔ payment modal opens.
2. **UPI Payment & UTR Entry**: Client scans QR code or transfers via UPI ➔ enters 12-digit UTR ➔ clicks "Submit UTR Number".
3. **Pending State Entry**: Booking status is saved as `"Pending Bank Verification"` ➔ automatically rendered in Orders Dashboard under the **Pending** tab.
4. **Admin Verification**: Admin navigates to Admin Panel ➔ reviews order & submitted UTR ➔ clicks "Verify Payment".
5. **Real-time Confirmation**: Status instantly updates to `"Confirmed"` ➔ booking appears under the **Confirmed** tab across all client devices seamlessly.
