const hre = require("hardhat");

async function main() {
  console.log("Deploying PrivateVoteExample Contract...");
  console.log("=========================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  console.log("Note: Voting is always active for tutorial purposes");

  // Deploy PrivateVoteExample (no constructor args)
  const PrivateVote = await hre.ethers.getContractFactory("PrivateVoteExample");
  const privateVote = await PrivateVote.deploy();
  await privateVote.waitForDeployment();
  
  const contractAddress = await privateVote.getAddress();
  console.log("PrivateVoteExample deployed to:", contractAddress);

  // Verify on Etherscan if on Sepolia
  if (hre.network.name === 'sepolia') {
    console.log("\nVerifying contract on Etherscan...");
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: []
      });
      console.log("✅ PrivateVoteExample verified successfully!");
      console.log(`View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
      console.log("Contract may already be verified or try again later");
    }
  }

  console.log("\n✅ PrivateVoteExample deployment complete!");
  console.log("Note: Voting is always active - no time restrictions for tutorial");
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
