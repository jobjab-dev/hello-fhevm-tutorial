const hre = require("hardhat");
const { updateContractAddress } = require("./update-addresses");

async function main() {
  console.log("🗳️ Deploying PrivateVoteExample contract...");

  // Clean build
  await hre.run("clean");
  await hre.run("compile", {
    sources: ["contracts/PrivateVoteExample.sol"]
  });

  // Deploy PrivateVoteExample (no constructor args)
  const PrivateVote = await hre.ethers.getContractFactory("PrivateVoteExample");
  const privateVote = await PrivateVote.deploy();
  await privateVote.waitForDeployment();
  
  const contractAddress = await privateVote.getAddress();
  console.log(`✅ PrivateVoteExample deployed to: ${contractAddress}`);

  // Update address in config files
  try {
    updateContractAddress('PrivateVote', contractAddress, hre.network.name);
  } catch (error) {
    console.warn('⚠️ Failed to update address config:', error.message);
  }

  // Auto-verify on Etherscan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔍 Waiting for block confirmations...");
    await privateVote.deploymentTransaction().wait(6);
    
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
      console.log(`Features: Private voting with encrypted tallies`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;
