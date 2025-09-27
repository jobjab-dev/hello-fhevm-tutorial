# Hello FHEVM — Interactive Tutorial

**The most beginner-friendly way to learn confidential blockchain development**

Learn FHEVM through **interactive lessons, quizzes, and demos**. No wallet required to start!

**[🎮 Try Live Demo](https://hello-fhevm-tutorial.vercel.app/)**

## 🎯 Learn 6 Essential FHE Concepts

1. **🔢 FHE Addition** - Basic encrypted arithmetic
2. **📊 FHE Counter** - Persistent encrypted state  
3. **🗳️ Private Voting** - Conditional logic with secrets
4. **🎯 Secret Number Game** - Encrypted comparisons & game logic
5. **🪙 Confidential Tokens** - Private balance management
6. **⚡ Advanced Patterns** - Production best practices & gas optimization

## 🏗️ Repository Overview

This tutorial consists of **two main parts**:

### 📚 **Interactive Frontend** (`/frontend/`)
- **Web-based learning platform** inspired by CryptoZombies
- **No blockchain connection needed** - learn through simulated demos
- **Progressive lessons** with explanations, quizzes, and interactive examples
- **Zama yellow/black theme** with responsive design
- **Built with**: React, Vite, simulated demos (no SDK required)

### 🔧 **Smart Contracts** (`/example/`)
- **6 production-ready contracts** demonstrating core FHE operations
- **Individual deploy scripts** with automatic Etherscan verification
- **Centralized address management** - no hardcoded addresses
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

# Deploy individually (with auto-verification & address updates):
npm run deploy:add         # FHEAdd contract
npm run deploy:counter     # FHECounter contract  
npm run deploy:voting      # PrivateVoting contract
npm run deploy:secretgame  # SecretNumberGame contract
npm run deploy:token       # ConfidentialERC20 contract
npm run deploy:optimized   # OptimizedFHE contract

# Or deploy all contracts at once:
npm run deploy:all         # Deploy all 6 contracts (lessons 1-6)
```

### Contract Verification
```bash
# Verify all deployed contracts on Etherscan
npm run verify:all
```

### Contract Address Management
```bash
# View current contract addresses
npm run addresses

# Update specific contract address manually (if needed)
npm run addresses:update SecretNumberGame 0x123...abc
```

### Clean Build Cache
```bash
# If you modified contracts, clean cache first
npm run clean

# Full rebuild process:
npm run clean && npm run build
```

## 📖 How to Explore This Repository

### 🎮 **Start Here**: Interactive Tutorial
1. **Run tutorial**: `npm run dev` (from repo root)
2. **Open browser**: http://localhost:5173
3. **Learn step-by-step**: 6 progressive lessons with quizzes and demos
4. **Get your score**: Complete all lessons to see final results

### 🔍 **Dive Deeper**: Smart Contracts
1. **Browse contracts**: `example/contracts/` - 6 examples with full comments
2. **Study deploy scripts**: `example/scripts/` - deployment + verification
3. **Address management**: `example/scripts/update-addresses.js` - centralized config
4. **Check configuration**: `example/hardhat.config.cjs` - network setup
5. **Deploy your own**: Follow setup instructions above

### 🎨 **Customize**: Frontend Code
1. **Main app**: `frontend/src/App.jsx` - tutorial logic and UI
2. **Lessons**: `frontend/src/lessons/` - individual lesson content
3. **Contract config**: `frontend/src/config/contracts.js` - address management
4. **Styling**: `frontend/src/styles.css` - Zama theme

## 🎮 What Makes This Special

- **🎓 Interactive Learning** - Step-by-step lessons with quizzes
- **🎮 Live Demos** - Try FHE operations without deploying
- **📊 Progress Tracking** - See your learning journey
- **🎨 Zama Theme** - Official yellow/black design
- **📱 Responsive** - Works on all devices
- **🚀 Auto-Deploy** - One-click deployment with verification
- **🔧 Smart Address Management** - Centralized contract configuration

## 🔧 Verified Contracts

Live examples on Sepolia testnet:

### Lessons 1-3 (Basic Concepts)
- **FHEAdd**: [0x6170A47265D93B816b63381585243dDD02D11D6c](https://sepolia.etherscan.io/address/0x6170A47265D93B816b63381585243dDD02D11D6c)
- **FHECounter**: [0xD568dBb5eDe5a835F7621CFADF3a1d1993b3311e](https://sepolia.etherscan.io/address/0xD568dBb5eDe5a835F7621CFADF3a1d1993b3311e)  
- **PrivateVoting**: [0xF7077681eF71E8083a15CC942D058366B26BBD44](https://sepolia.etherscan.io/address/0xF7077681eF71E8083a15CC942D058366B26BBD44)

### Lessons 4-6 (Advanced Concepts)
- **SecretNumberGame**: *Deploy with `npm run deploy:secretgame`*
- **ConfidentialERC20**: *Deploy with `npm run deploy:token`*
- **OptimizedFHE**: *Deploy with `npm run deploy:optimized`*

> 📋 Use `npm run addresses` to view current addresses after deployment

## 🏆 Bounty Submission

**Zama Bounty Program Season 10** - Most beginner-friendly "Hello FHEVM" tutorial

✅ **Educational**: 6 interactive lessons covering basic to advanced FHE concepts  
✅ **Complete**: 6 examples + deployment + frontend + address management  
✅ **Effective**: Learn in 45 minutes, deploy in 5 minutes  
✅ **Production-Ready**: Gas optimization patterns and best practices  

**Production dApp Demo**: [Private Vote FHEVM](https://private-vote-fhevm-app.vercel.app/)  
**Production Repository**: [Private-Vote-FHEVM](https://github.com/jobjab-dev/Private-Vote-FHEVM)

## 📚 Additional Resources

- **[Contract Management Guide](./CONTRACT_MANAGEMENT.md)** - How to manage contract addresses
- **[Zama Documentation](https://docs.zama.ai/)** - Official FHEVM documentation
- **[Bounty Details](https://github.com/zama-ai/bounty-program)** - Season 10 requirements

---

*Built for Zama Bounty Program Season 10*

