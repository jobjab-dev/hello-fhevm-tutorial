const hre = require("hardhat");
const { updateContractAddress } = require("./update-addresses");

async function main() {
  console.log("🪙 Deploying ConfidentialERC20 contract...");

  // Clean build
  await hre.run("clean");
  await hre.run("compile", {
    sources: ["contracts/ConfidentialERC20.sol"]
  });

  // Deploy ConfidentialERC20 (no constructor args)
  const ConfidentialERC20 = await hre.ethers.getContractFactory("ConfidentialERC20");
  const token = await ConfidentialERC20.deploy();

  await token.waitForDeployment();
  const contractAddress = await token.getAddress();

  console.log(`✅ ConfidentialERC20 deployed to: ${contractAddress}`);
  console.log(`📊 Use initializeSupply() to set encrypted initial supply`);

  // Update address in config files
  try {
    updateContractAddress('ConfidentialERC20', contractAddress, hre.network.name);
  } catch (error) {
    console.warn('⚠️ Failed to update address config:', error.message);
  }

  // Auto-verify on Etherscan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 Waiting for block confirmations...");
    await token.deploymentTransaction().wait(6);
    
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
      console.log(`Token name: Confidential Token (CTKN)`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;
