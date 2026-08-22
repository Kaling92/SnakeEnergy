# 🐍 Snake Energy — Decentralized Finance Web Application

**Snake Energy** is a full-stack decentralized finance (DeFi) web application that simulates a crypto wallet ecosystem. It features user authentication, multi-asset portfolio management, NFT minting/trading, token swapping, blockchain transaction logging, and bilingual (EN/VI) support.

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
│                      http://localhost:5173                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  React 19 • TypeScript • React Router • Recharts • Axios   │ │
│  │  CSS Modules • Context API (Wallet + Language)              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
         │  REST API (axios + JWT)                │
         ▼                                        ▼
┌────────────────────────────┐    ┌──────────────────────────────┐
│  BACKEND (Node.js/Express) │    │  BLOCKCHAIN (Python/Flask)    │
│  http://localhost:5000     │───▶│  http://localhost:5001        │
│  ┌──────────────────────┐  │    │  ┌────────────────────────┐  │
│  │ MongoDB (Atlas)      │  │    │  │ Proof-of-Work Mining   │  │
│  │ JWT Authentication   │  │    │  │ Chain Validation       │  │
│  │ RESTful Controllers  │  │    │  │ Transaction Logging    │  │
│  └──────────────────────┘  │    │  └────────────────────────┘  │
└────────────────────────────┘    └──────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

| Tool       | Version   | Purpose                      |
|------------|-----------|------------------------------|
| Node.js    | ≥ 18.x    | Backend + Frontend runtime   |
| Python     | ≥ 3.9     | Blockchain server            |
| MongoDB    | Atlas     | Persistent database          |
| npm        | ≥ 9.x     | Package manager              |

### 1. Clone & Install

```bash
git clone <repository-url>
cd SnakeEnergyApp
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/<db>
JWT_SECRET=<your-secret-key>
WALLET_ENCRYPTION_KEY=<your-encryption-key>
BLOCKCHAIN_URL=http://localhost:5001
```

### 3. Start All Servers

```powershell
cd backend
.\start_backend.ps1
```

This starts both:
- **Blockchain Server** → `http://localhost:5001` (Python Flask)
- **Backend API** → `http://localhost:5000` (Node.js Express)

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
SnakeEnergyApp/
├── backend/
│   ├── config/              # Environment config (env.js)
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── walletController.js
│   │   ├── nftController.js
│   │   ├── swapController.js
│   │   ├── txController.js
│   │   ├── notificationController.js
│   │   ├── userController.js
│   │   ├── vaultsController.js
│   │   └── yieldController.js
│   ├── middleware/           # JWT authentication middleware
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Wallet.js
│   │   ├── Asset.js
│   │   ├── NFT.js
│   │   ├── Transaction.js
│   │   ├── Notification.js
│   │   ├── Vault.js
│   │   └── YieldVault.js
│   ├── routes/              # Express route definitions
│   ├── utils/               # Logger, helpers
│   ├── index.js             # Entry point
│   ├── start_backend.ps1    # PowerShell launcher
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client with JWT interceptor
│   │   ├── assets/          # CSS Modules + images (NFT art, icons)
│   │   ├── components/      # Shared components
│   │   │   ├── PageLayout.tsx   # Main app shell (header + sidebar)
│   │   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   │   └── LanguageToggle.tsx
│   │   ├── context/         # React Context providers
│   │   │   ├── WalletContext.tsx  # Auth, assets, transactions state
│   │   │   └── LanguageContext.tsx # EN/VI language state
│   │   ├── i18n/            # Translation strings
│   │   │   └── translations.ts
│   │   ├── pages/           # 17 page components
│   │   │   ├── Login.tsx
│   │   │   ├── SignUp.tsx
│   │   │   ├── Homepage.tsx     # Dashboard
│   │   │   ├── Assets.tsx
│   │   │   ├── NFT.tsx
│   │   │   ├── Swap.tsx
│   │   │   ├── Send.tsx
│   │   │   ├── Receive.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Wallet.tsx
│   │   │   ├── WalletSuccess.tsx
│   │   │   ├── ExploreVaults.tsx
│   │   │   ├── Search.tsx
│   │   │   ├── Notifications.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Security.tsx
│   │   ├── App.tsx          # Router + providers
│   │   ├── main.tsx         # React DOM entry
│   │   └── index.css        # Global styles
│   └── package.json
│
└── README.md
```

---

## 🔑 Key Features

### 🔐 Authentication & Security
- JWT-based login/signup with bcrypt password hashing
- Auto-redirect on token expiry (401 interceptor)
- Security Center: 2FA setup, login history, device management
- Anti-phishing code configuration

### 💼 Wallet & Asset Management
- Wallet creation with encrypted private keys
- Real-time portfolio dashboard with live market prices (CoinGecko API)
- Multi-asset support: ETH, BTC, SOL, BNB, ADA, DOGE
- Send/Receive crypto with address validation
- QR code generation for receiving funds

### 🎨 NFT Vault
- 6 themed AI-generated NFT collectibles across 3 collections
- Mint new NFTs with image upload
- Transfer ownership between wallets
- Update listing status and pricing (On Sale, Auction, Hidden)
- All actions logged to the blockchain ledger

### 🔄 Token Swap
- Token-to-token exchange with live rate calculation
- Slippage tolerance configuration
- Transaction fee estimation
- Swap history tracking

### 📊 Analytics & Charts
- Portfolio allocation breakdown (Recharts pie/bar charts)
- P&L performance tracking
- Market price tables with 24h change indicators

### 🌐 Bilingual Support (EN/VI)
- Full Vietnamese and English translations
- Language toggle persisted to localStorage
- Context-based rendering — no page reload needed

### 🔔 Notification System
- Transaction alerts, security warnings, system notices
- Read/unread status tracking
- Time-relative formatting

### ⛓️ Blockchain Integration
- Python Flask-based proof-of-work blockchain
- Every transaction (send, receive, swap, NFT mint/transfer) logged as a block
- Chain validation and tamper detection
- Block explorer via API

---

## 🛠️ Tech Stack

| Layer        | Technology                               |
|--------------|------------------------------------------|
| Frontend     | React 19, TypeScript, Vite 8, CSS Modules |
| Routing      | React Router v7                          |
| Charts       | Recharts                                 |
| State        | React Context API (Wallet + Language)    |
| HTTP Client  | Axios with JWT interceptors              |
| Backend      | Node.js, Express 5                       |
| Database     | MongoDB Atlas (Mongoose 9)               |
| Auth         | JWT + bcryptjs                           |
| Blockchain   | Python Flask, Proof-of-Work consensus    |
| Market Data  | CoinGecko Public API (with fallback)     |
| Deployment   | Render (backend) + Vercel (frontend)     |

---

## 🌐 API Endpoints

| Method | Endpoint                     | Auth | Description                   |
|--------|------------------------------|------|-------------------------------|
| POST   | `/api/auth/login`            | ✗    | User login                    |
| POST   | `/api/auth/signup`           | ✗    | User registration             |
| GET    | `/api/wallet/dashboard`      | ✓    | Dashboard data + market prices|
| GET    | `/api/wallet/assets`         | ✓    | User asset balances           |
| POST   | `/api/wallet/send`           | ✓    | Send crypto                   |
| GET    | `/api/wallet/receive`        | ✓    | Get receive address + QR      |
| POST   | `/api/swap/execute`          | ✓    | Execute token swap            |
| GET    | `/api/nfts`                  | ✓    | List user NFTs                |
| POST   | `/api/nfts/mint`             | ✓    | Mint new NFT                  |
| POST   | `/api/nfts/transfer`         | ✓    | Transfer NFT ownership        |
| PUT    | `/api/nfts/:id/status`       | ✓    | Update NFT listing            |
| GET    | `/api/transactions`          | ✓    | Transaction history           |
| GET    | `/api/notifications`         | ✓    | User notifications            |
| GET    | `/api/vaults`                | ✓    | DeFi vaults                   |
| GET    | `/api/yield/pools`           | ✓    | Yield farming pools           |

---

## 📦 Environment Variables

### Backend (`backend/.env`)

| Variable              | Required | Description                        |
|-----------------------|----------|------------------------------------|
| `PORT`                | Yes      | API server port (default: 5000)    |
| `MONGODB_URI`         | Yes      | MongoDB Atlas connection string    |
| `JWT_SECRET`          | Yes      | Secret for signing JWT tokens      |
| `WALLET_ENCRYPTION_KEY`| Yes     | AES key for wallet encryption      |
| `BLOCKCHAIN_URL`      | No       | Python blockchain URL (default: localhost:5001) |

### Frontend (`frontend/.env`)

| Variable        | Required | Description                           |
|-----------------|----------|---------------------------------------|
| `VITE_API_URL`  | No       | Backend API URL (default: localhost:5000) |

---

## 🧪 Development

### Running Tests

```bash
cd backend
npm test
```

### Building for Production

```bash
cd frontend
npm run build
```

### Deployment

- **Backend**: Deploy to [Render](https://render.com) — set environment variables in dashboard
- **Frontend**: Deploy to [Vercel](https://vercel.com) — set `VITE_API_URL` to production backend URL

---

## 📄 License

This project is licensed under the ISC License.
