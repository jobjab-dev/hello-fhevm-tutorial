// Centralized contract configuration
// This file manages all deployed contract addresses for the tutorial

const NETWORKS = {
  SEPOLIA: 'sepolia',
  LOCALHOST: 'localhost',
  HARDHAT: 'hardhat'
};

// Contract addresses by network
const CONTRACT_ADDRESSES = {
  [NETWORKS.SEPOLIA]: {
    // Lessons 1-3 (existing contracts)
    FHEAdd: "0x2606Bad46E99691f4aF1e9682Aaa83668D2C7ffB",
    Counter: "0x02DeB7C4F1198251C0Cb5cFd06c0292ae231FFca", 
    PrivateVote: "0x7AF2867f9362E12CA0FcA13985f279b61F4B23Df",
    SecretNumberGame: "0xE9cff9dbb688834e29933962f1eF920031728EFc",
    ConfidentialERC20: "0xA894748bB89BD392D9d58f2A9a7203E0488485D7", 
    OptimizedFHE: "0x6a7E8A53bC8093264fb1b1325687C3090F937e9B", 
  },
  
  [NETWORKS.LOCALHOST]: {
    // Local development addresses (will be set during local deployment)
    FHEAdd: null,
    Counter: null,
    PrivateVote: null,
    SecretNumberGame: null,
    ConfidentialERC20: null,
    OptimizedFHE: null,
  }
};

// Contract metadata
const CONTRACT_INFO = {
  FHEAdd: {
    name: "FHE Addition",
    lesson: 1,
    description: "Basic FHE addition operations",
    explorerUrl: (network, address) => getExplorerUrl(network, address)
  },
  Counter: {
    name: "FHE Counter", 
    lesson: 2,
    description: "Encrypted state management",
    explorerUrl: (network, address) => getExplorerUrl(network, address)
  },
  PrivateVote: {
    name: "Private Voting",
    lesson: 3, 
    description: "Conditional logic with secrets",
    explorerUrl: (network, address) => getExplorerUrl(network, address)
  },
  SecretNumberGame: {
    name: "Secret Number Game",
    lesson: 4,
    description: "Encrypted comparisons & game logic", 
    explorerUrl: (network, address) => getExplorerUrl(network, address)
  },
  ConfidentialERC20: {
    name: "Confidential Token",
    lesson: 5,
    description: "Private balance management",
    explorerUrl: (network, address) => getExplorerUrl(network, address)
  },
  OptimizedFHE: {
    name: "Optimized FHE",
    lesson: 6,
    description: "Production best practices",
    explorerUrl: (network, address) => getExplorerUrl(network, address)
  }
};

// Helper functions
function getExplorerUrl(network, address) {
  const explorers = {
    [NETWORKS.SEPOLIA]: `https://sepolia.etherscan.io/address/${address}`,
    [NETWORKS.LOCALHOST]: null,
    [NETWORKS.HARDHAT]: null
  };
  return explorers[network];
}

function getCurrentNetwork() {
  // Default to sepolia for tutorial
  return NETWORKS.SEPOLIA;
}

// Main export functions
export function getContractAddress(contractName, network = getCurrentNetwork()) {
  const addresses = CONTRACT_ADDRESSES[network];
  if (!addresses) {
    throw new Error(`Network ${network} not supported`);
  }
  
  const address = addresses[contractName];
  if (!address) {
    console.warn(`Contract ${contractName} not deployed on ${network}`);
    return null;
  }
  
  return address;
}

export function getContractInfo(contractName) {
  return CONTRACT_INFO[contractName] || null;
}

export function getAllContracts(network = getCurrentNetwork()) {
  const addresses = CONTRACT_ADDRESSES[network];
  if (!addresses) return {};
  
  return Object.entries(addresses).map(([name, address]) => ({
    name,
    address,
    info: CONTRACT_INFO[name],
    explorerUrl: address ? getExplorerUrl(network, address) : null
  }));
}

export function getContractsByLesson(lesson, network = getCurrentNetwork()) {
  return getAllContracts(network).filter(contract => 
    contract.info && contract.info.lesson === lesson
  );
}

export function updateContractAddress(contractName, address, network = getCurrentNetwork()) {
  if (CONTRACT_ADDRESSES[network]) {
    CONTRACT_ADDRESSES[network][contractName] = address;
    console.log(`✅ Updated ${contractName} address: ${address}`);
  }
}

// Validation helpers
export function validateAddress(address) {
  return address && address.match(/^0x[a-fA-F0-9]{40}$/);
}

export function isContractDeployed(contractName, network = getCurrentNetwork()) {
  const address = getContractAddress(contractName, network);
  return validateAddress(address);
}

// Export constants for external use
export { NETWORKS, CONTRACT_ADDRESSES, CONTRACT_INFO };
