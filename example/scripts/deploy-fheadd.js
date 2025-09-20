const hre = require("hardhat");

async function main() {
  console.log("Deploying FHEAdd Contract...");
  console.log("==============================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy FHEAdd
  const FHEAdd = await hre.ethers.getContractFactory("FHEAdd");
  const fheAdd = await FHEAdd.deploy();
  await fheAdd.waitForDeployment();
  
  const contractAddress = await fheAdd.getAddress();
  console.log("FHEAdd deployed to:", contractAddress);

  // Verify on Etherscan if on Sepolia
  if (hre.network.name === 'sepolia') {
    console.log("\nWaiting for Etherscan to index the contract...");
    await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
    
    console.log("Verifying contract on Etherscan...");
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: []
      });
      console.log("✅ FHEAdd verified successfully!");
      console.log(`View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
      console.log("Manual verification:");
      console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
    }
  }

  console.log("\n✅ FHEAdd deployment complete!");
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
