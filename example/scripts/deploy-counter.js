const hre = require("hardhat");

async function main() {
  console.log("Deploying FHECounter Contract...");
  console.log("=================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy FHECounter
  const FHECounter = await hre.ethers.getContractFactory("FHECounter");
  const fheCounter = await FHECounter.deploy();
  await fheCounter.waitForDeployment();
  
  const contractAddress = await fheCounter.getAddress();
  console.log("FHECounter deployed to:", contractAddress);

  // Verify on Etherscan if on Sepolia
  if (hre.network.name === 'sepolia') {
    console.log("\nVerifying contract on Etherscan...");
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: []
      });
      console.log("✅ FHECounter verified successfully!");
      console.log(`View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
      console.log("Contract may already be verified or try again later");
    }
  }

  console.log("\n✅ FHECounter deployment complete!");
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
