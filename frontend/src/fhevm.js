// Encrypt helpers using @zama-fhe/relayer-sdk (CDN). Comments in English as requested.
let instance = null;

export async function initFhevm() {
  if (instance) return instance;
  
  // Check for CDN-loaded SDK
  if (!window.initSDK || !window.createInstance || !window.SepoliaConfig) {
    throw new Error('relayerSDK missing (CDN not loaded properly)');
  }
  
  // Initialize WASM components first
  await window.initSDK();
  
  // Create instance with Sepolia config and MetaMask provider
  const config = { ...window.SepoliaConfig, network: window.ethereum };
  instance = await window.createInstance(config);
  
  return instance;
}

export async function encryptChoice(contractAddress, userAddress, index) {
  const inst = await initFhevm();
  
  // Create encrypted input buffer bound to contract and user
  const buffer = inst.createEncryptedInput(contractAddress, userAddress);
  
  // Add choice as uint32 (0=Yes, 1=No)
  buffer.add32(index);
  
  // Encrypt and get handles + proof
  const ciphertexts = await buffer.encrypt();
  
  // Return the handle (already in correct format) and proof
  return {
    handle: ciphertexts.handles[0],
    inputProof: ciphertexts.inputProof
  };
}

export async function encryptValue(contractAddress, userAddress, value, bits = 32) {
  const inst = await initFhevm();
  
  // Create encrypted input buffer bound to contract and user
  const buffer = inst.createEncryptedInput(contractAddress, userAddress);
  
  // Add value based on bit size
  if (bits === 8) {
    buffer.add8(value);
  } else if (bits === 16) {
    buffer.add16(value);
  } else if (bits === 32) {
    buffer.add32(value);
  } else if (bits === 64) {
    buffer.add64(value);
  } else {
    throw new Error(`Unsupported bit size: ${bits}`);
  }
  
  // Encrypt and get handles + proof
  const ciphertexts = await buffer.encrypt();
  
  return {
    handle: ciphertexts.handles[0],
    inputProof: ciphertexts.inputProof
  };
}

