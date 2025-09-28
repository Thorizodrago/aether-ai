# 🌟 Aether AI - Advanced Web3 & DeFi AI Assistant

**Aether AI** is an intelligent Web3 assistant built for the Algorand blockchain ecosystem. It combines cutting-edge AI technology with comprehensive DeFi functionality, offering users both conversational AI guidance and direct blockchain interactions through intuitive agent commands.

## 🎯 Goal

The main goals of Aether AI are:
- **Intelligent Web3 Guidance**: AI-powered assistance for Algorand blockchain operations
- **Agent Command System**: Direct blockchain interactions through simple chat commands  
- **Seamless DeFi Integration**: Native support for DEX operations, token swaps, and yield farming
- **User-Friendly Experience**: Complex blockchain operations made simple through conversational interface
- **Educational Platform**: Learn Web3 concepts while performing real transactions

## ✨ Features

- 🤖 **Google Gemini AI Integration** - Advanced AI responses for Web3 and Algorand questions
- 💼 **Pera Wallet Integration** - Secure connection with Algorand's premier wallet
- 🎮 **Agent Command System** - 7 powerful commands for direct blockchain interactions:
  - `/send` - Send ALGO or ASAs to any wallet address
  - `/getBalance` - Check wallet balance with portfolio analytics  
  - `/conract` - AI write and deploy conracts
- 💸 **Real Blockchain Operations** - Actual on-chain transactions, not simulations
- 🎨 **Dynamic UI** - Color-coded agent commands with visual feedback
- 🔍 **Smart Contract Library** - Production-ready PyTeal contracts for each command
- 💎 **Premium Features** - Advanced analytics and priority support
- 🌐 **Cross-Platform** - Web application with mobile-responsive design

## 🛠️ Technologies Used

### Frontend
- **React 18** - Modern React with hooks and TypeScript
- **TypeScript** - Type-safe development with strict typing
- **Vite** - Lightning-fast build tool and dev server
- **CSS3** - Custom styling with animations and responsive design

### Backend & AI
- **Express.js** - High-performance Node.js web framework
- **TypeScript** - End-to-end type safety
- **Google Gemini AI** - Advanced AI model for Algorand-specific responses
- **CORS** - Secure cross-origin resource sharing

### Blockchain & DeFi
- **Algorand** - High-performance blockchain with instant finality
- **Pera Wallet** - Official Algorand wallet integration
- **PyTeal** - Algorand smart contract framework
- **Tinyman SDK** - Leading Algorand DEX integration
- **AlgoSDK** - Comprehensive Algorand JavaScript SDK

### Smart Contracts
- **Python 3.8+** - Modern Python with asyncio support
- **PyTeal Framework** - Algorand's official smart contract language
- **Advanced DeFi Features** - AMM integration, MEV protection, yield optimization

### Development Tools
- **Docker** - Containerized development environment
- **ESLint** - Code quality and consistency
- **Git** - Version control with comprehensive .gitignore
- **VS Code** - Optimized development setup

## 🏗️ Project Structure

```
aether-ai/
├── frontend/                     # React + TypeScript application
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── ChatScreen.tsx   # Main AI chat interface
│   │   │   ├── ConnectScreen.tsx # Wallet connection
│   │   │   └── PremiumPage.tsx  # Premium features
│   │   ├── services/           # API services
│   │   │   └── aiService.ts    # Google Gemini integration
│   │   ├── App.tsx             # Main application component
│   │   └── main.tsx            # Application entry point
│   ├── package.json
│   └── vite.config.ts          # Vite configuration
├── backend/                     # Express.js API server
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   │   ├── authController.ts
│   │   │   └── txnController.ts
│   │   ├── libs/               # Shared libraries
│   │   │   ├── algoClient.ts   # Algorand SDK integration
│   │   │   └── tinymanClient.ts # Tinyman DEX integration
│   │   ├── routes/             # API routes
│   │   │   ├── auth.ts
│   │   │   └── tx.ts
│   │   ├── config.ts           # Environment configuration
│   │   ├── geminiClient.ts     # AI integration
│   │   └── index.ts            # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── contracts/                   # Smart contract library
│   ├── examples/               # Production-ready contracts
│   │   ├── send_to_wallet.py   # Multi-token transfer system
│   │   ├── get_balance.py      # Portfolio analytics
│   │   ├── swap_algo.py        # AMM with slippage protection
│   │   ├── open_dex.py         # Multi-DEX aggregation
│   │   └── connect_tinyman.py  # Advanced Tinyman integration
│   └── README.md               # Contract documentation
├── infra/                      # Infrastructure services
│   ├── localai/               # Local AI service (Python/Flask)
│   └── context7/              # Context management (Node.js)
├── docker-compose.yml          # Docker orchestration
└── package.json               # Root package configuration
```

## 🚀 Development Setup

### Prerequisites

1. **Node.js** (v18 or higher)
```bash
# Check Node.js version
node --version
```

2. **Python** (v3.8 or higher) - for smart contracts
```bash
# Check Python version
python3 --version
```

3. **Docker** (optional but recommended)
```bash
# Check Docker version
docker --version
```

### Setup Steps

1. **Clone repository**
```bash
git clone https://github.com/yourusername/aether-ai.git
cd aether-ai
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

3. **Environment Configuration**

Create `.env` files for backend:
```bash
# backend/.env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
ALGORAND_SERVER=https://testnet-api.algonode.cloud
ALGORAND_INDEXER=https://testnet-idx.algonode.cloud
ALGORAND_PORT=443
ALGORAND_TOKEN=""
NODE_ENV=development
PORT=4000
```

4. **Start development servers**
```bash
# Option 1: Start both servers simultaneously (recommended)
npm run dev

# Option 2: Start servers separately
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

5. **Access the application**
   - **Frontend**: `http://localhost:3002`
   - **Backend API**: `http://localhost:4000`
   - **Health Check**: `http://localhost:4000/health`

### Docker Development (Alternative)

1. **Start with Docker Compose**
```bash
docker-compose up -d
```

2. **View logs**
```bash
docker-compose logs -f
```

3. **Stop services**
```bash
docker-compose down
```

### Smart Contract Development

1. **Install PyTeal**
```bash
pip3 install pyteal py-algorand-sdk
```

2. **Test contracts**
```bash
cd contracts/examples
python3 send_to_wallet.py
python3 get_balance.py
# ... test other contracts
```

3. **Deploy contracts**
```bash
# Use Algorand CLI or integrate with your deployment script
goal app create --creator YOUR_ADDRESS --approval-prog approval.teal --clear-prog clear.teal
```

## 🔧 Configuration

### Google Gemini AI Setup

1. **Get API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your environment variables

2. **Configure Backend**
```typescript
// backend/src/config.ts
export const config = {
  GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
  // ... other config
};
```

### Pera Wallet Setup

1. **Install Pera Wallet**
   - Download from [App Store](https://apps.apple.com/app/pera-algo-wallet/id1459898525) or [Google Play](https://play.google.com/store/apps/details?id=com.algorand.android)
   - Or use [Pera Web Wallet](https://web.perawallet.app)

2. **Switch to TestNet**
   - Open Pera Wallet
   - Go to Settings → Developer Settings
   - Enable TestNet mode

3. **Get Test ALGO**
   - Use [Algorand TestNet Dispenser](https://testnet.algoexplorer.io/dispenser)
   - Enter your wallet address and request test ALGO

## 📱 Usage Guide

### 1. Connect Wallet
- Open the application at `http://localhost:3002`
- Click "Connect to Pera Wallet"
- Approve the connection in your Pera Wallet
- Your wallet address is now connected and displayed

### 2. AI Chat Mode
- Select "Ask" mode in the chat interface
- Ask questions about Algorand, Web3, or DeFi
- Examples:
  - "What is Algorand?"
  - "How do smart contracts work?"
  - "What is the difference between MainNet and TestNet?"

### 3. Agent Command Mode
- Select "Agent" mode to access blockchain commands
- Type `/` to see available agent commands with color-coded suggestions

#### Agent Commands:

**🌸 Send to Wallet (`/send`)**
```
/send GBZXCF7KLBGAUR7DKFSJ34J... 5.5
```
- Send ALGO or ASAs to any wallet address
- Supports batch transfers and fee calculation
- Real-time transaction confirmation

**💜 Get Balance (`/getBalance`)**  
```
/getBalance
```
- Check your complete wallet balance
- Portfolio analytics with yield calculations
- Historical balance tracking



**🍃 Develop Contracy (`/contract`)**
```
/contract
```
- Develop a contract using Aether
- Deploy your contract easily
- Track and test with algokit support

## 🧪 Testing

### Unit Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test
```

### Integration Tests
```bash
# Test AI integration
curl -X POST http://localhost:4000/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Algorand?"}'
```

### Smart Contract Tests
```bash
cd contracts/examples
python3 -m pytest test_contracts.py -v
```

## 🚀 Deployment

### Production Build

1. **Build frontend**
```bash
cd frontend
npm run build
```

2. **Build backend**
```bash
cd backend  
npm run build
```

3. **Start production server**
```bash
cd backend
npm start
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)

```bash
# Production environment variables
NODE_ENV=production
GOOGLE_GEMINI_API_KEY=your_production_api_key
ALGORAND_SERVER=https://mainnet-api.algonode.cloud
ALGORAND_INDEXER=https://mainnet-idx.algonode.cloud
FRONTEND_URL=https://your-domain.com
```

### Development Guidelines

- Follow TypeScript strict mode requirements
- Write comprehensive tests for new features  
- Update documentation for API changes
- Ensure smart contracts have proper test coverage
- Follow the existing code style and conventions

## 🔍 API Documentation

### Backend Endpoints

#### AI Assistant
- `POST /ai/ask` - Ask AI questions about Algorand/Web3

#### Authentication
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `POST /auth/verify` - JWT token verification

#### Transactions
- `GET /tx/balance/:address` - Get wallet balance
- `POST /tx/send` - Send ALGO/ASA transactions
- `GET /tx/history/:address` - Transaction history

#### Health & Status
- `GET /health` - API health check
- `GET /` - API information and available endpoints

## 📋 Todo & Roadmap

### Immediate (v1.1)
- [ ] MainNet support for production trading
- [ ] Advanced portfolio analytics dashboard
- [x] Transaction history and export features
- [x] Mobile app development (React Native)

### Short Term (v1.2-1.3)
- [ ] Multi-language support (Turkish, Spanish, French)
- [ ] NFT integration and marketplace features
- [ ] Advanced yield farming strategies
- [ ] Cross-chain bridge integrations (Ethereum, Binance)

### Long Term (v2.0+)
- [ ] AI-driven portfolio optimization
- [ ] Social trading features
- [ ] DAO governance integration
- [ ] Advanced analytics and market insights
- [ ] Institutional trading features

## 🛡️ Security

### Smart Contract Security
- All contracts audited for common vulnerabilities
- Reentrancy protection implemented
- Input validation and sanitization
- Access control and permission management

### API Security
- JWT token authentication
- Rate limiting on all endpoints
- CORS protection with allowed origins
- Input validation and sanitization
- Secure environment variable management

### Wallet Security
- Client-side wallet integration (no private keys on server)
- Secure transaction signing flow
- Multi-signature support ready
- Hardware wallet integration planned

## 🎉 Success Metrics

- ✅ **AI Integration**: Google Gemini AI successfully integrated
- ✅ **Blockchain Operations**: All 7 agent commands fully functional
- ✅ **Smart Contracts**: Production-ready contract library created
- ✅ **UI/UX**: Responsive design with dynamic command feedback
- ✅ **Wallet Integration**: Seamless Pera Wallet connection
- ✅ **Development Environment**: Docker-based development setup
- ✅ **Security**: Comprehensive .gitignore and security measures

---

## 🌐 Deploy with AlgoKit

### Prerequisites for Deployment
- AlgoKit installed (`pip install algokit`)
- TestNet account with some ALGOs for deployment fees
- Environment variables configured

### Deployment Steps

⚠️ **SECURITY WARNING**: Never commit real mnemonics to version control!

1. **Set up environment variables in project root `.env`:**
   ```bash
   # WARNING: Use test accounts only with minimal TestNet ALGOs
   DEPLOYER_MNEMONIC="your 25 word test mnemonic here"
   NETWORK=testnet
   ```

2. **Deploy to TestNet:**
   ```bash
   # AlgoKit will use .env and DEPLOYER_MNEMONIC to deploy contracts
   algokit project deploy testnet
   ```

3. **Verify deployment:**
   - Check AlgoExplorer TestNet for deployed contracts
   - Update frontend environment variables with contract addresses

**Note**: AlgoKit deployment is optional for now and primarily used for smart contract deployment when needed.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- Git

### Quick Start with Docker

1. **Clone and navigate to project:**
   ```bash
   git clone <repository-url>
   cd aether-ai
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the applications:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - LocalAI Service: http://localhost:8080
   - Context7 Service: http://localhost:8081
   - PostgreSQL: localhost:5432

### Development Setup (Local)

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐳 Docker Commands

- `docker-compose up` - Start all services
- `docker-compose up -d` - Start in detached mode
- `docker-compose down` - Stop all services
- `docker-compose logs [service]` - View logs
- `docker-compose exec [service] bash` - Access service shell

## 🔧 Environment Variables

### Frontend (.env)
```
# WARNING: Never commit real mnemonics or private keys to version control
# Use test mnemonics only for local development if absolutely needed

# API Configuration
VITE_API_URL=http://localhost:4000
VITE_ALGORAND_NETWORK=TESTNET

# Algorand TestNet Endpoints
VITE_ALGOD_API=https://testnet-api.algonode.cloud
VITE_INDEXER_API=https://testnet-idx.algonode.cloud

# Pera Wallet TestNet Configuration
VITE_PERA_CHAIN_ID=416002
```

### Backend (.env)
```
# WARNING: Never commit real mnemonics or private keys to version control
# Use test mnemonics only for local development if absolutely needed

NETWORK=testnet
PORT=4000
ALGOD_API=https://testnet-api.algonode.cloud
INDEXER_API=https://testnet-idx.algonode.cloud
JWT_SECRET=a_change_me_value

# Optional for AlgoKit deploy (local dev only)
DEPLOYER_MNEMONIC="YOUR 25 WORD MNEMONIC FOR DEPLOY (DEV ONLY)"
```

## 📱 Pera Wallet Setup

### Developer Instructions:
1. **Switch Pera Wallet to TestNet:**
   - Open Pera Wallet mobile app
   - Go to Settings → Developer Settings
   - Change Network to TestNet
   
2. **Environment Configuration:**
   - Copy `.env.example` to `.env` in both frontend/ and backend/
   - Update VITE_API_URL if backend runs on different port
   
3. **Testing Backend Connection:**
   - Start backend: `npm run dev` in backend/
   - Visit http://localhost:4000/auth/request-challenge in browser
   - Should return JSON response (not error)
   
4. **Troubleshooting:**
   - Confirm Pera Wallet is in TestNet mode
   - Verify VITE_API_URL points to running backend
   - Check browser console for connection errors

## 🏛️ Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL 15
- **Infrastructure**: Docker + Docker Compose
- **AI Services**: LocalAI (Python/Flask) + Context7 (Node.js)

## 📝 API Endpoints

### Backend API (Port 3001)
- `GET /` - API information
- `GET /health` - Health check

### LocalAI Service (Port 8080)
- `GET /` - Service information  
- `GET /health` - Health check
- `GET /api/models` - Available AI models

### Context7 Service (Port 8081)
- `GET /` - Service information
- `GET /health` - Health check
- `GET /api/context` - Context management

## 🔄 Development Workflow

1. Make changes to your code
2. Services will auto-reload in development mode
3. Test your changes
4. Commit and push to repository

## 📋 Todo

- [ ] Add authentication system
- [ ] Implement AI model integration
- [ ] Add context management features
- [ ] Set up monitoring and logging
- [ ] Add comprehensive testing
- [ ] Implement CI/CD pipeline

---
**Made by Efe Yılmaz with ❤️, ☕, and 🤖 for the Algorand Ecosystem.**

**This project won 2nd place in the Algorand Hackathon.🥳**
