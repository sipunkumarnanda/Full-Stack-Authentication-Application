# AuthFlow — Modern React Authentication Frontend

A production-ready, minimalist, and accessible authentication and session management frontend built with React, Vite, Tailwind CSS, and React Hook Form. Fully integrated with an Express, MongoDB, Redis, and JWT HTTP-only cookie backend.

---

## Features

- **JWT Session Security**: Secure HTTP-only cookie authentication (`accessToken`). Tokens are completely inaccessible to client-side scripts, protecting against XSS token theft.
- **Minimalist & Professional Design System**: Built strictly adhering to the curated palette:
  - Primary Indigo: `#4F46E5`
  - Soft Off-white Background: `#F8FAFC`
  - Pure White Cards: `#FFFFFF`
  - Slate Main Typography: `#0F172A`
  - Subtle Borders: `#E2E8F0`
  - Accessible Success (`#16A34A`) & Error (`#DC2626`)
- **Interactive Registration Flow**:
  - Pre-validation matching backend regex and length constraints.
  - Live dynamic password strength meter (Weak / Fair / Good / Strong).
  - Real-time password criteria checklist (8+ chars, lowercase, uppercase, number, symbol).
  - Explicit omission of client-only fields (`confirmPassword`, `terms`) when dispatching payloads to the backend.
- **6-Digit OTP Verification Screen**:
  - Independent digit input boxes with auto-advance on keystroke.
  - Seamless backspace navigation across inputs.
  - Full clipboard paste handling (automatically populates all 6 boxes).
  - Active 5-minute expiry countdown timer (300 seconds) matching backend Redis TTL.
  - 60-second cooldown on OTP resend matching backend rate limits.
  - Zero OTP exposure in client console or logs.
- **Self-Service Password Recovery**:
  - Forgot password request with generic response privacy protection.
  - Reset password with OTP and strict backend field alignment (`password`).
- **Protected Dashboard**:
  - Session verification check on mount via `/api/auth/me`.
  - Immediate redirect to `/login` for unauthenticated requests with return location state.
  - Instant session termination and state reset on sign out.
- **Address Management**:
  - View saved delivery addresses.
  - Add new addresses with default designation support.
  - Delete addresses with confirmation dialog.
- **Resilient API Layer**:
  - Centralized Axios client (`withCredentials: true`).
  - Standardized error parsing for HTTP `400`, `401`, `403`, `404`, `409`, `429`, and `500`.
  - Parses `Retry-After` header when encountering `429 Too Many Requests`.

---

## API Endpoints Integrated

| HTTP Method | Backend Route | Purpose | Payload / Parameters |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register user & trigger OTP email | `{ username, email, password, firstName, lastName }` |
| `POST` | `/api/auth/verify-otp` | Verify OTP & create MongoDB account | `{ email, otp }` |
| `POST` | `/api/auth/resend-otp` | Resend registration OTP email | `{ email }` |
| `POST` | `/api/auth/login` | Authenticate & issue HTTP-only cookie | `{ email, password }` |
| `POST` | `/api/auth/logout` | Clear HTTP-only session cookie | None |
| `GET` | `/api/auth/me` | Fetch active profile via cookie | Cookie Header |
| `POST` | `/api/auth/forgot-password` | Request password reset code | `{ email }` |
| `POST` | `/api/auth/reset-password` | Verify reset OTP & set new password | `{ email, otp, password }` |
| `GET` | `/api/auth/users/me/addresses` | Fetch saved user addresses | Cookie Header |
| `POST` | `/api/auth/users/me/addresses` | Save new delivery address | `{ street, city, state, pincode, country, phone, isDefault }` |
| `DELETE` | `/api/auth/users/me/addresses/:addressId` | Delete saved address | URL Parameter `:addressId` |

---

## Directory Structure

```text
Frontend/
├── public/
├── src/
│   ├── __tests__/
│   │   ├── authFormValidation.test.jsx
│   │   ├── authFlowAndProtection.test.jsx
│   │   ├── otpInput.test.jsx
│   │   └── passwordToggle.test.jsx
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── OtpInput.jsx
│   │   │   └── PasswordInput.jsx
│   │   └── layout/
│   │       ├── AuthLayout.jsx
│   │       └── Navbar.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   ├── Register.jsx
│   │   ├── ResetPassword.jsx
│   │   └── VerifyOtp.jsx
│   ├── routes/
│   │   ├── ProtectedRoute.jsx
│   │   └── PublicRoute.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── authService.js
│   ├── test/
│   │   └── setup.js
│   ├── utils/
│   │   └── validation.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## Getting Started

### 1. Prerequisites

- Node.js `v18+` or `v20+` (Tested on `v24`)
- Backend service running on `http://localhost:3000`

### 2. Install Dependencies

```bash
cd Frontend
npm install
```

### 3. Environment Configuration

Ensure `.env` contains the backend API base path:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. Run Development Server

```bash
npm run dev
```

The application runs at `http://localhost:5173`.

### 5. Run Unit and Integration Tests

```bash
npm test
```

### 6. Build for Production

```bash
npm run build
```
