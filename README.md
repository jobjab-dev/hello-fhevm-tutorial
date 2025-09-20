# Hello FHEVM — Interactive Tutorial

**The most beginner-friendly way to learn confidential blockchain development**

Learn FHEVM through **interactive lessons, quizzes, and demos**. No wallet required to start!

**[🎮 Try Live Demo](https://hello-fhevm-tutorial.vercel.app/)**

## 🎯 Learn 3 Core FHE Concepts

1. **🔢 FHE Addition** - Basic encrypted arithmetic
2. **📊 FHE Counter** - Persistent encrypted state  
3. **🗳️ Private Voting** - Conditional logic with secrets

## 🏗️ Repository Overview

This tutorial consists of **two main parts**:

### 📚 **Interactive Frontend** (`/frontend/`)
- **Web-based learning platform** inspired by CryptoZombies
- **No blockchain connection needed** - learn through simulated demos
- **Progressive lessons** with explanations, quizzes, and interactive examples
- **Zama yellow/black theme** with responsive design
- **Built with**: React, Vite, Zama relayer SDK (for demos only)

### 🔧 **Smart Contracts** (`/example/`)
- **3 production-ready contracts** demonstrating core FHE operations
- **Individual deploy scripts** with automatic Etherscan verification
- **Clean, commented code** following Zama best practices
- **Built with**: Hardhat, @fhevm/solidity, ethers.js

## 🚀 Quick Start

### Interactive Learning (Recommended)
```bash
# Start the tutorial
npm run dev
# Opens http://localhost:5173 automatically
```

### Deploy Real Contracts
```bash
# Setup environment
cd example && cp .env.example .env
# Edit .env: add ZAMA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY

# Install and compile
npm install && npm run build

# Deploy individually (with auto-verification):
npm run deploy:add      # FHEAdd contract
npm run deploy:counter  # FHECounter contract  
npm run deploy:voting   # PrivateVoting contract
```

### Clean Build Cache
```bash
# If you modified contracts, clean cache first
npm run clean
```

## 📖 How to Explore This Repository

### 🎮 **Start Here**: Interactive Tutorial
1. **Run tutorial**: `npm run dev` (from repo root)
2. **Open browser**: http://localhost:5173
3. **Learn step-by-step**: 3 lessons with quizzes and demos
4. **Get your score**: Complete all lessons to see final results

### 🔍 **Dive Deeper**: Smart Contracts
1. **Browse contracts**: `example/contracts/` - 3 examples with full comments
2. **Study deploy scripts**: `example/scripts/` - deployment + verification
3. **Check configuration**: `example/hardhat.config.cjs` - network setup
4. **Deploy your own**: Follow setup instructions above

### 🎨 **Customize**: Frontend Code
1. **Main app**: `frontend/src/App.jsx` - tutorial logic and UI
2. **Styling**: `frontend/src/styles.css` - Zama theme
3. **FHE helpers**: `frontend/src/fhevm.js` - encryption demos (mock)

## 🎮 What Makes This Special

- **🎓 Interactive Learning** - Step-by-step lessons with quizzes
- **🎮 Live Demos** - Try FHE operations without deploying
- **📊 Progress Tracking** - See your learning journey
- **🎨 Zama Theme** - Official yellow/black design
- **📱 Responsive** - Works on all devices
- **🚀 Auto-Deploy** - One-click deployment with verification

## 🔧 Verified Contracts

Live examples on Sepolia testnet:

- **FHEAdd**: [0x6170A47265D93B816b63381585243dDD02D11D6c](https://sepolia.etherscan.io/address/0x6170A47265D93B816b63381585243dDD02D11D6c)
- **FHECounter**: [0xD568dBb5eDe5a835F7621CFADF3a1d1993b3311e](https://sepolia.etherscan.io/address/0xD568dBb5eDe5a835F7621CFADF3a1d1993b3311e)  
- **PrivateVoting**: [0xF7077681eF71E8083a15CC942D058366B26BBD44](https://sepolia.etherscan.io/address/0xF7077681eF71E8083a15CC942D058366B26BBD44)

## 🏆 Bounty Submission

**Zama Bounty Program Season 10** - Most beginner-friendly "Hello FHEVM" tutorial

✅ **Educational**: Interactive lessons without crypto jargon  
✅ **Complete**: 3 examples + deployment + frontend  
✅ **Effective**: Learn in 30 minutes, deploy in 5 minutes  

**Production dApp Demo**: [Private Vote FHEVM](https://private-vote-fhevm-app.vercel.app/)  
**Production Repository**: [Private-Vote-FHEVM](https://github.com/jobjab-dev/Private-Vote-FHEVM)

---

*Built for Zama Bounty Program Season 10*

