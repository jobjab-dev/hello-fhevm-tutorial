require('dotenv/config');
require('@nomicfoundation/hardhat-toolbox');
require('@fhevm/hardhat-plugin');

const { ZAMA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

module.exports = {
  solidity: '0.8.24',
  networks: {
    hardhat: {},
    sepolia: {
      url: ZAMA_RPC_URL || '',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY || ''
    }
  },
  sourcify: {
    enabled: false
  }
};
