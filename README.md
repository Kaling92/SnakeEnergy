# Snake Energy - Decentralized Finance Web Application

**Snake Energy** is a frontend decentralized finance (DeFi) web application.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository** (if not already cloned):
```bash
git clone <repository-url>
cd SnakeEnergy
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run the server**:
```bash
node server.js
```

## 🖥️ Usage

Open your browser and navigate to: http://localhost:3000


## 🚀 Key Features

### 🔐 Authentication & Security
- **Email & Password Authentication**: Secure user registration and login with email verification
- **Biometric Login**: Fingerprint and Face ID support for seamless access
- **Multi-Factor Authentication (MFA)**: Enhanced security with Google Authenticator
- **Security Center**: Comprehensive security management with login history, device management, and security recommendations
- **Anti-Phishing**: Phishing code configuration to protect against fraudulent activities

### 💼 Digital Asset Management
- **Wallet Management**: Secure storage and management of digital assets
- **NFT Gallery**: Browse and showcase unique Non-Fungible Tokens
- **Transaction History**: Detailed records of all incoming and outgoing transactions
- **Asset Transfer**: Send and receive cryptocurrencies with ease
- **Network Support**: Multi-chain support including Mainnet, Tron, and Meta Mask (Layer 2)

### 📊 Financial Services
- **Crypto Trading**: Buy and sell cryptocurrencies with real-time market data
- **Marketplace**: Comprehensive cryptocurrency marketplace with trending assets
- **Portfolio Tracking**: Real-time monitoring of asset performance and market trends
- **Notifications**: Instant alerts for critical updates, transactions, and security events

### 🌐 Multi-Language Support
- **Vietnamese (VI)**: Full localization for Vietnamese users
- **English (EN)**: Support for English-speaking users
- **Language auto-detection** based on browser settings

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Structure and content
- **CSS3**: Styling and animations
- **JavaScript (Vanilla)**: Client-side logic and interactivity
- **FontAwesome**: Icon library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework

## 📁 Project Structure

```
SnakeEnergy/
├── public/                    # Frontend assets
│   ├── CSS/                   # Stylesheets
│   ├── JS/                    # JavaScript files
│   ├── Images/                # Images and icons
│   ├── Index.html             # Home page
│   ├── Dashboard.html         # Dashboard page
│   ├── Analytics.html         # Analytics page
│   ├── Assets.html            # Assets page
│   ├── Notifications.html     # Notifications page
│   ├── Security.html          # Security page
│   ├── Settings.html          # Settings page
│   ├── Receive.html           # Receive crypto page
│   ├── Send.html              # Send crypto page
│   ├── Transactions.html      # Transactions page
│   ├── Swap.html              # Swap page
│   ├── Nft.html               # NFT page
├── node_modules/              # Node.js dependencies
├── .env                       # Environment variables
├── server.js                  # Backend entry point
└── package.json               # Project dependencies
```

## 📂 Development

### Adding New Features

1. **Create HTML page** in the `public/` directory
2. **Add navigation** to `public/CSS/Homepage.css`
3. **Implement frontend logic** in `public/JS/` files
4. **Create API endpoints** in `server.js`
5. **Add database schema** if needed
6. **Update translations** in `public/JS/lang.js`

### Translations

To add a new language:

1. Update `public/JS/lang.js` with language definitions
2. Create new translation files in `public/lang/` directory
3. Update `public/JS/i18n.js` for language switching
