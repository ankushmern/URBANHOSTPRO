# 🛠️ CookMantra — Comprehensive Features & Workflow Documentation

This document provides a detailed breakdown of all user-facing, administrative, security, and payment features implemented in CookMantra.

---

## 👤 1. User Functionalities

### 🍳 Gourmet Dish Exploration
- **Categorized Menu**: Browse dishes across categories: *Main Course*, *Starters*, *Drinks*, *Desserts*, and *Masterclass*.
- **Live Search & Filter**: Real-time filtering by category or keyword search.
- **Detailed Dish Modals**: View dish preparation time, chef tags, dietary badges, serving sizes, and calorie counts.

### 📅 Chef Booking & Customization
- **Flexible Service Selection**: Book a Personal Chef for 1 Meal, Full Day, Chef Masterclass, or Customized Party Catering.
- **Date & Time Picker**: Choose service execution dates and preferred arrival times.
- **Special Cooking Instructions**: Specify spice tolerance, dietary preferences (Jain, Vegan, Gluten-Free), and kitchen setup details.

### 💳 Real-Time Payment & UTR Submission
- **UPI QR Code Integration**: Instant payment via Google Pay, PhonePe, Paytm, or BHIM.
- **Bank Account Transfer**: Direct IMPS/NEFT transfer support with IFSC details.
- **UTR / Ref Number Input**: Users submit their 12-digit UPI reference number directly after transfer.
- **Automatic Pending Status**: Upon submission, booking enters `Pending Bank Verification` status immediately without refreshing.

### 📦 Order History & Real-Time Dashboard
- **Status Filter Tabs**: View orders categorized into **All**, **Confirmed**, and **Pending**.
- **Real-time Status Badges**:
  - 🟡 `Pending Bank Verification`: Awaiting admin verification of UTR.
  - 🟢 `Confirmed`: Payment verified; chef assigned and scheduled.
  - 🔴 `Payment Failed`: Rejected or invalid UTR submission.
- **Downloadable Receipts**: Instant visual modal receipt generation for any booking with itemized breakdown and GST invoice format.
- **Booking Cancellation**: Users can request cancellation for pending bookings.

### ❤️ Wishlist & Personal Profile
- **Saved Favorites**: Heart icon toggle to save/remove dishes from personal wishlist.
- **Profile Management**: Update name, phone number, default delivery address, and profile picture.

---

## 👑 2. Admin Capabilities

### 📊 Real-Time Analytics Dashboard
- **Live Order Counters**: Instant tally of Total Bookings, Pending Verifications, Confirmed Orders, and Estimated Revenue.
- **Direct Calculations**: Metrics dynamically re-calculate upon state updates without polling delays.

### 💳 Payment Verification & Order Management
- **Verification Portal**: Admins review customer-submitted UTR reference numbers and payment details.
- **One-Click Payment Approval**: Clicking `Verify Payment` transitions booking from `Pending` ➔ `Confirmed` across all user dashboards in real time.
- **Reject & Delete Controls**: Reject invalid UTRs or purge test bookings cleanly.
- **CSV Data Export**: One-click download of all orders in formatted `.csv` Excel format.

### 🍽️ Dish Catalog Management
- **Add New Dishes**: Form modal to add custom dishes with image URLs, categories, prices, and prep times.
- **Edit & Delete**: Update existing menu items or remove discontinued dishes.

### 👥 User Access Controls
- **User Directory**: Table displaying all registered users, roles (User, Chef, Admin), phone numbers, and join dates.
- **Ban / Unban User**: Lock abusive accounts or restore user permissions dynamically.

---

## 🛡️ 3. Security & Quality Assurance

- **JWT Token Authentication**: Secure session storage with auto-login capabilities.
- **Input Validation**: Protection against malicious script injection and empty payloads.
- **Error Boundaries & Toast Feedback**: Clean visual toast alerts for all user actions (Booking, Payment, Cancel, Error).
