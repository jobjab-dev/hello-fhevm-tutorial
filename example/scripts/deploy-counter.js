const hre = require("hardhat");
const { updateContractAddress } = require("./update-addresses");

async function main() {
  console.log("📊 Deploying FHECounter contract...");

  // Clean build
  await hre.run("clean");
  await hre.run("compile", {
    sources: ["contracts/FHECounter.sol"]
  });

  // Deploy FHECounter
  const FHECounter = await hre.ethers.getContractFactory("FHECounter");
  const fheCounter = await FHECounter.deploy();
  await fheCounter.waitForDeployment();
  
  const contractAddress = await fheCounter.getAddress();
  console.log(`✅ FHECounter deployed to: ${contractAddress}`);

  // Update address in config files
  try {
    updateContractAddress('Counter', contractAddress, hre.network.name);
  } catch (error) {
    console.warn('⚠️ Failed to update address config:', error.message);
  }

  // Auto-verify on Etherscan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 Waiting for block confirmations...");
    await fheCounter.deploymentTransaction().wait(6);
    
    try {
      console.log("📋 Verifying contract on Etherscan...");
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  return contractAddress;
}

if (require.main === module) {
  main()
    .then((address) => {
      console.log(`\n🎉 Deployment complete!`);
      console.log(`Contract address: ${address}`);
      console.log(`Features: Encrypted state management`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;
