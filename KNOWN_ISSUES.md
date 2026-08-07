# 🐛 CookMantra — Known Issues, Operational Notes & Edge Cases

This document lists known edge cases, environment behaviors, and design considerations for the **CookMantra Full-Stack Application**.

---

## 📌 Items Overview

### 1. MongoDB Offline In-Memory Fallback Logging
- **Behavior**: When running locally without an active MongoDB server on port 27017, log messages warning `MongoDB connection error... using hybrid store` may appear.
- **Resolution / Design Intent**: This is intentional by design. CookMantra includes a hybrid fallback memory store so that the application remains 100% interactive and functional even during standalone preview or offline development.

### 2. Browser Popup Blocker on PDF Receipt Downloads
- **Behavior**: On certain strict browser configurations, downloading PDF invoices via `jsPDF` / `html2canvas` may trigger a download notification or popup blocker warning.
- **Resolution**: The download trigger uses standard `a.download` blob links without external popups. Users experiencing blocked downloads should allow download permissions for the domain.

### 3. Razorpay Test Mode Key Validation
- **Behavior**: When testing payments with dummy card details in `development` mode without a live Razorpay merchant key, signature verification falls back to sandbox validation mode.
- **Resolution**: Configure valid `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env` for production webhooks and real money collection.

### 4. Sandboxed Container HMR Disabled Notice
- **Behavior**: Developers may see console log entries regarding Vite WebSocket connection failures (`[vite] failed to connect to websocket`).
- **Resolution / Design Intent**: HMR is disabled in cloud sandboxed container preview environments by design (`DISABLE_HMR=true`) to prevent flickering during incremental file saves. This is completely benign and does not affect runtime execution.
