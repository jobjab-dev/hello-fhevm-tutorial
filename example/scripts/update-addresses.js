const fs = require('fs');
const path = require('path');

// Paths
const ADDRESSES_FILE = path.join(__dirname, '../deployments/addresses.json');
const FRONTEND_CONFIG_FILE = path.join(__dirname, '../../frontend/src/config/contracts.js');

/**
 * Update contract address in addresses.json
 */
function updateAddressesJson(contractName, address, network = 'sepolia') {
  let addresses = {};
  
  // Read existing addresses
  if (fs.existsSync(ADDRESSES_FILE)) {
    const data = fs.readFileSync(ADDRESSES_FILE, 'utf8');
    addresses = JSON.parse(data);
  }
  
  // Initialize network if doesn't exist
  if (!addresses[network]) {
    addresses[network] = {};
  }
  
  // Update address
  addresses[network][contractName] = address;
  addresses.lastUpdated = new Date().toISOString();
  
  // Write back to file
  fs.writeFileSync(ADDRESSES_FILE, JSON.stringify(addresses, null, 2));
  console.log(`✅ Updated ${contractName} in addresses.json: ${address}`);
}

/**
 * Update frontend config file
 */
function updateFrontendConfig(contractName, address, network = 'sepolia') {
  if (!fs.existsSync(FRONTEND_CONFIG_FILE)) {
    console.warn('⚠️ Frontend config file not found, skipping update');
    return;
  }
  
  let configContent = fs.readFileSync(FRONTEND_CONFIG_FILE, 'utf8');
  
  // Find the network section and update the address
  const networkKey = network.toUpperCase();
  const pattern = new RegExp(
    `(\\[NETWORKS\\.${networkKey}\\]:\\s*{[^}]*${contractName}:\\s*")[^"]*(")`
  );
  
  if (pattern.test(configContent)) {
    configContent = configContent.replace(pattern, `$1${address}$2`);
    fs.writeFileSync(FRONTEND_CONFIG_FILE, configContent);
    console.log(`✅ Updated ${contractName} in frontend config: ${address}`);
  } else {
    console.warn(`⚠️ Could not find ${contractName} in frontend config for ${network}`);
  }
}

/**
 * Main update function
 */
function updateContractAddress(contractName, address, network = 'sepolia') {
  console.log(`🔄 Updating ${contractName} address: ${address}`);
  
  // Validate address
  if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error(`Invalid address: ${address}`);
  }
  
  // Update both files
  updateAddressesJson(contractName, address, network);
  updateFrontendConfig(contractName, address, network);
  
  console.log(`✅ Successfully updated ${contractName} address in all files`);
}

/**
 * Get all current addresses
 */
function getAllAddresses(network = 'sepolia') {
  if (!fs.existsSync(ADDRESSES_FILE)) {
    return {};
  }
  
  const data = fs.readFileSync(ADDRESSES_FILE, 'utf8');
  const addresses = JSON.parse(data);
  return addresses[network] || {};
}

/**
 * Display current addresses
 */
function displayAddresses(network = 'sepolia') {
  const addresses = getAllAddresses(network);
  
  console.log(`\n📋 Current contract addresses on ${network}:`);
  console.log('='.repeat(50));
  
  Object.entries(addresses).forEach(([name, address]) => {
    const status = address ? '✅' : '❌';
    const displayAddr = address || 'Not deployed';
    console.log(`${status} ${name}: ${displayAddr}`);
  });
  
  console.log('='.repeat(50));
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    displayAddresses();
  } else if (args[0] === 'update' && args.length >= 3) {
    const [, contractName, address, network = 'sepolia'] = args;
    updateContractAddress(contractName, address, network);
  } else {
    console.log('Usage:');
    console.log('  node update-addresses.js                           # Display current addresses');
    console.log('  node update-addresses.js update <contract> <addr> # Update contract address');
    console.log('  node update-addresses.js update <contract> <addr> <network> # Update for specific network');
    console.log('');
    console.log('Examples:');
    console.log('  node update-addresses.js update SecretNumberGame 0x123...abc');
    console.log('  node update-addresses.js update ConfidentialERC20 0x456...def sepolia');
  }
}

module.exports = {
  updateContractAddress,
  getAllAddresses,
  displayAddresses,
  updateAddressesJson,
  updateFrontendConfig
};
