const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ALL 6 tutorial contracts...");
  console.log(`Network: ${hre.network.name}`);
  console.log("=" .repeat(60));

  // Clean and compile all contracts once
  console.log("\n🧹 Cleaning and compiling all contracts...");
  await hre.run("clean");
  await hre.run("compile");
  console.log("✅ All contracts compiled successfully!");

  const contracts = [];

  try {
    // Deploy Lesson 1: FHEAdd
    console.log("\n🔢 Deploying FHEAdd (Lesson 1)...");
    const FHEAdd = await hre.ethers.getContractFactory("FHEAdd");
    const fheAdd = await FHEAdd.deploy();
    await fheAdd.waitForDeployment();
    const addAddress = await fheAdd.getAddress();
    console.log(`✅ FHEAdd deployed to: ${addAddress}`);
    
    // Update address
    const { updateContractAddress } = require("./update-addresses");
    try {
      updateContractAddress('FHEAdd', addAddress, hre.network.name);
    } catch (error) {
      console.warn('⚠️ Failed to update FHEAdd address:', error.message);
    }
    contracts.push({ name: "FHEAdd", address: addAddress, lesson: 1 });

    // Deploy Lesson 2: FHECounter
    console.log("\n📊 Deploying FHECounter (Lesson 2)...");
    const FHECounter = await hre.ethers.getContractFactory("FHECounter");
    const fheCounter = await FHECounter.deploy();
    await fheCounter.waitForDeployment();
    const counterAddress = await fheCounter.getAddress();
    console.log(`✅ FHECounter deployed to: ${counterAddress}`);
    
    try {
      updateContractAddress('Counter', counterAddress, hre.network.name);
    } catch (error) {
      console.warn('⚠️ Failed to update Counter address:', error.message);
    }
    contracts.push({ name: "FHECounter", address: counterAddress, lesson: 2 });

    // Deploy Lesson 3: PrivateVoteExample
    console.log("\n🗳️ Deploying PrivateVoteExample (Lesson 3)...");
    const PrivateVote = await hre.ethers.getContractFactory("PrivateVoteExample");
    const privateVote = await PrivateVote.deploy();
    await privateVote.waitForDeployment();
    const votingAddress = await privateVote.getAddress();
    console.log(`✅ PrivateVoteExample deployed to: ${votingAddress}`);
    
    try {
      updateContractAddress('PrivateVote', votingAddress, hre.network.name);
    } catch (error) {
      console.warn('⚠️ Failed to update PrivateVote address:', error.message);
    }
    contracts.push({ name: "PrivateVoteExample", address: votingAddress, lesson: 3 });

    // Deploy Lesson 4: SecretNumberGame
    console.log("\n🎯 Deploying SecretNumberGame (Lesson 4)...");
    const SecretNumberGame = await hre.ethers.getContractFactory("SecretNumberGame");
    const secretGame = await SecretNumberGame.deploy();
    await secretGame.waitForDeployment();
    const secretGameAddress = await secretGame.getAddress();
    console.log(`✅ SecretNumberGame deployed to: ${secretGameAddress}`);
    
    try {
      updateContractAddress('SecretNumberGame', secretGameAddress, hre.network.name);
    } catch (error) {
      console.warn('⚠️ Failed to update SecretNumberGame address:', error.message);
    }
    contracts.push({ name: "SecretNumberGame", address: secretGameAddress, lesson: 4 });

    // Deploy Lesson 5: ConfidentialERC20
    console.log("\n🪙 Deploying ConfidentialERC20 (Lesson 5)...");
    const ConfidentialERC20 = await hre.ethers.getContractFactory("ConfidentialERC20");
    const token = await ConfidentialERC20.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log(`✅ ConfidentialERC20 deployed to: ${tokenAddress}`);
    
    try {
      updateContractAddress('ConfidentialERC20', tokenAddress, hre.network.name);
    } catch (error) {
      console.warn('⚠️ Failed to update ConfidentialERC20 address:', error.message);
    }
    contracts.push({ name: "ConfidentialERC20", address: tokenAddress, lesson: 5 });

    // Deploy Lesson 6: OptimizedFHE
    console.log("\n⚡ Deploying OptimizedFHE (Lesson 6)...");
    const OptimizedFHE = await hre.ethers.getContractFactory("OptimizedFHE");
    const optimized = await OptimizedFHE.deploy();
    await optimized.waitForDeployment();
    const optimizedAddress = await optimized.getAddress();
    console.log(`✅ OptimizedFHE deployed to: ${optimizedAddress}`);
    
    try {
      updateContractAddress('OptimizedFHE', optimizedAddress, hre.network.name);
    } catch (error) {
      console.warn('⚠️ Failed to update OptimizedFHE address:', error.message);
    }
    contracts.push({ name: "OptimizedFHE", address: optimizedAddress, lesson: 6 });

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 ALL 6 CONTRACTS DEPLOYED SUCCESSFULLY!");
    console.log("=".repeat(60));
    
    contracts.forEach(contract => {
      console.log(`📝 Lesson ${contract.lesson}: ${contract.name}`);
      console.log(`   Address: ${contract.address}`);
      console.log(`   Explorer: https://sepolia.etherscan.io/address/${contract.address}`);
      console.log("");
    });

    console.log("💡 Tutorial is now fully deployed!");
    console.log("🎮 Start learning: npm run dev");
    console.log("📋 Check addresses: npm run addresses");

  } catch (error) {
    console.error("💥 Deployment failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log("\n🏆 Complete tutorial deployment finished!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script failed:", error);
      process.exit(1);
    });
}

module.exports = main;
