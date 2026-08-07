# 🔌 CookMantra — Complete REST API Reference Documentation

**Base URL**: `http://localhost:3000/api/v1`  
**Protocol**: HTTP/HTTPS  
**Data Format**: JSON (`Content-Type: application/json`)

---

## 📌 Table of Contents
1. [Authentication APIs](#1-authentication-apis)
2. [User Management APIs](#2-user-management-apis)
3. [Booking & Order APIs](#3-booking--order-apis)
4. [Payment & Razorpay APIs](#4-payment--razorpay-apis)
5. [Admin & Management APIs](#5-admin--management-apis)
6. [Review & Rating APIs](#6-review--rating-apis)
7. [Inquiry & Event APIs](#7-inquiry--event-apis)
8. [Dish & Catalog APIs](#8-dish--catalog-apis)
9. [Health & System Monitoring APIs](#9-health--system-monitoring-apis)
10. [Error Handling & Standard Responses](#10-error-handling--standard-responses)

---

## 1. Authentication APIs

### 1.1 Register User
- **Endpoint**: `POST /auth/register`
- **Authentication**: None (Public)
- **Request Payload**:
  ```json
  {
    "name": "Eren Yeager",
    "email": "eren@cookmantra.com",
    "password": "SecurePassword123!",
    "phone": "9876543210"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "66b1a2c3d4e5f67890123456",
      "name": "Eren Yeager",
      "email": "eren@cookmantra.com",
      "role": "User"
    }
  }
  ```

### 1.2 Login User
- **Endpoint**: `POST /auth/login`
- **Authentication**: None (Public)
- **Request Payload**:
  ```json
  {
    "email": "eren@cookmantra.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "66b1a2c3d4e5f67890123456",
      "name": "Eren Yeager",
      "email": "eren@cookmantra.com",
      "role": "User"
    }
  }
  ```

### 1.3 Get Current Profile (`/me`)
- **Endpoint**: `GET /auth/me`
- **Authentication**: Required (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "66b1a2c3d4e5f67890123456",
      "name": "Eren Yeager",
      "email": "eren@cookmantra.com",
      "phone": "9876543210",
      "role": "User",
      "addresses": []
    }
  }
  ```

---

## 2. User Management APIs

### 2.1 Get User Profile
- **Endpoint**: `GET /user/profile`
- **Authentication**: Required (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "profile": {
      "id": "66b1a2c3d4e5f67890123456",
      "name": "Eren Yeager",
      "email": "eren@cookmantra.com",
      "phone": "9876543210",
      "addresses": [
        {
          "_id": "addr_101",
          "street": "123 Gourmet Lane",
          "city": "Mumbai",
          "pincode": "400001",
          "isDefault": true
        }
      ]
    }
  }
  ```

### 2.2 Add Delivery Address
- **Endpoint**: `POST /user/addresses`
- **Authentication**: Required (`Bearer <token>`)
- **Request Payload**:
  ```json
  {
    "street": "456 Culinary Street",
    "city": "Bengaluru",
    "pincode": "560001",
    "tag": "Home"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Address added successfully",
    "addresses": [...]
  }
  ```

### 2.3 Toggle Wishlist Item
- **Endpoint**: `POST /user/wishlist/toggle`
- **Authentication**: Required (`Bearer <token>`)
- **Request Payload**:
  ```json
  {
    "dishId": "dish_001"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "wishlist": ["dish_001", "dish_004"]
  }
  ```

---

## 3. Booking & Order APIs

### 3.1 Create New Booking
- **Endpoint**: `POST /bookings`
- **Authentication**: Optional / Required (`Bearer <token>`)
- **Request Payload**:
  ```json
  {
    "chefName": "Master Chef Vikas",
    "serviceDetail": "Royal Indian Gourmet Private Dining [Guests: 4]",
    "date": "2026-08-15",
    "time": "19:30",
    "address": "123 Gourmet Lane, Mumbai",
    "name": "Eren Yeager",
    "phone": "9876543210",
    "amount": 2499
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Booking created successfully in Pending state",
    "booking": {
      "_id": "bk_1722384910",
      "status": "Pending Bank Verification",
      "amount": 2499,
      "date": "2026-08-15"
    }
  }
  ```

### 3.2 Get My Bookings
- **Endpoint**: `GET /bookings/my`
- **Authentication**: Required (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "bookings": [
      {
        "_id": "bk_1722384910",
        "serviceDetail": "Royal Indian Gourmet Private Dining",
        "date": "2026-08-15",
        "time": "19:30",
        "status": "Confirmed",
        "amount": 2499
      }
    ]
  }
  ```

---

## 4. Payment & Razorpay APIs

### 4.1 Create Razorpay Order
- **Endpoint**: `POST /payments/create-order`
- **Authentication**: Optional / Required
- **Request Payload**:
  ```json
  {
    "amount": 2499,
    "currency": "INR",
    "receipt": "receipt_bk_1722384910"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "order": {
      "id": "order_KzX991827361",
      "amount": 249900,
      "currency": "INR",
      "receipt": "receipt_bk_1722384910"
    }
  }
  ```

### 4.2 Verify Razorpay Payment Signature
- **Endpoint**: `POST /payments/verify`
- **Authentication**: Optional / Required
- **Request Payload**:
  ```json
  {
    "razorpay_order_id": "order_KzX991827361",
    "razorpay_payment_id": "pay_KzX998877665",
    "razorpay_signature": "4668b5a04e57e937d25e019..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Payment verified successfully"
  }
  ```

---

## 5. Admin & Management APIs

### 5.1 Get Admin Analytics & System Stats
- **Endpoint**: `GET /admin/stats`
- **Authentication**: Required (`Admin Role Only`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "stats": {
      "totalRevenue": 148500,
      "totalBookings": 42,
      "totalUsers": 128,
      "pendingVerifications": 3
    }
  }
  ```

### 5.2 List & Filter Users
- **Endpoint**: `GET /admin/users`
- **Authentication**: Required (`Admin Role Only`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 128,
    "users": [...]
  }
  ```

### 5.3 Ban or Unban User
- **Endpoint**: `PATCH /admin/users/:id/ban`
- **Authentication**: Required (`Admin Role Only`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User ban status toggled successfully",
    "isBanned": true
  }
  ```

---

## 6. Review & Rating APIs

### 6.1 Get Reviews for a Dish
- **Endpoint**: `GET /reviews?dishId=dish_001`
- **Authentication**: None (Public)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 5,
    "reviews": [...]
  }
  ```

### 6.2 Submit a Dish Review
- **Endpoint**: `POST /reviews`
- **Authentication**: Required (`Bearer <token>`)
- **Request Payload**:
  ```json
  {
    "dishId": "dish_001",
    "rating": 5,
    "comment": "Exquisite flavors! The chef prepared everything perfectly."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Review submitted successfully"
  }
  ```

---

## 7. Inquiry & Event APIs

### 7.1 Submit Catering Inquiry
- **Endpoint**: `POST /inquiries`
- **Authentication**: None (Public)
- **Request Payload**:
  ```json
  {
    "name": "Samantha Reed",
    "email": "samantha@example.com",
    "phone": "9876543210",
    "eventDate": "2026-09-20",
    "eventType": "Corporate Gala",
    "guestCount": 50,
    "message": "Inquiring about 5-course gourmet dining for corporate leadership."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Inquiry submitted successfully"
  }
  ```

---

## 8. Dish & Catalog APIs

### 8.1 Fetch All Dishes
- **Endpoint**: `GET /dishes`
- **Authentication**: None (Public)
- **Query Parameters**: `category`, `search`, `limit`, `cursor`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 12,
    "dishes": [...]
  }
  ```

---

## 9. Health & System Monitoring APIs

### 9.1 Extended Health Check
- **Endpoint**: `GET /api/health/extended`
- **Authentication**: None (Public)
- **Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-08-05T20:30:00.000Z",
    "uptimeSeconds": 1420,
    "memory": {
      "rssMb": 85.2,
      "heapUsedMb": 42.1
    },
    "database": {
      "isConnected": true,
      "host": "cluster0.mongodb.net"
    }
  }
  ```

---

## 10. Error Handling & Standard Responses

CookMantra uses standard HTTP status codes and a consistent JSON payload structure for error responses:

```json
{
  "success": false,
  "error": "Descriptive error message",
  "statusCode": 400
}
```

### Common HTTP Status Codes:
- **`200 OK`**: Request succeeded.
- **`201 Created`**: Resource created successfully.
- **`400 Bad Request`**: Validation or syntax failure.
- **`401 Unauthorized`**: Missing or expired JWT token.
- **`403 Forbidden`**: Insufficient permissions (Requires Admin role).
- **`404 Not Found`**: Target endpoint or resource does not exist.
- **`429 Too Many Requests`**: Rate limit exceeded (300 requests / 15 mins).
- **`500 Internal Server Error`**: Unexpected server exception.
