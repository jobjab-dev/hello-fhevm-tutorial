const hre = require("hardhat");
const { getAllAddresses } = require("./update-addresses");

async function main() {
  console.log("🔍 Verifying all deployed contracts on Etherscan...");
  console.log(`Network: ${hre.network.name}`);
  console.log("=" .repeat(50));

  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    console.log("⚠️ Verification not needed for local networks");
    return;
  }

  // Get current addresses
  const addresses = getAllAddresses(hre.network.name);
  
  if (Object.keys(addresses).length === 0) {
    console.log("❌ No deployed contracts found. Deploy contracts first:");
    console.log("   npm run deploy:all");
    return;
  }

  console.log(`\n📋 Found ${Object.keys(addresses).length} contracts to verify:`);
  Object.entries(addresses).forEach(([name, address]) => {
    if (address) {
      console.log(`   ${name}: ${address}`);
    }
  });

  console.log("\n⏳ Starting verification process...");
  
  const results = [];
  
  for (const [contractName, address] of Object.entries(addresses)) {
    if (!address) {
      console.log(`⏭️ Skipping ${contractName} (not deployed)`);
      continue;
    }

    try {
      console.log(`\n📋 Verifying ${contractName}...`);
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log(`✅ ${contractName} verified successfully!`);
      results.push({ name: contractName, address, status: 'verified' });
    } catch (error) {
      if (error.message.includes('already been verified')) {
        console.log(`✅ ${contractName} already verified!`);
        results.push({ name: contractName, address, status: 'already verified' });
      } else {
        console.log(`❌ ${contractName} verification failed:`, error.message);
        results.push({ name: contractName, address, status: 'failed', error: error.message });
      }
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("🏆 VERIFICATION SUMMARY");
  console.log("=".repeat(50));
  
  results.forEach(result => {
    const statusIcon = result.status === 'verified' || result.status === 'already verified' ? '✅' : '❌';
    console.log(`${statusIcon} ${result.name}: ${result.status}`);
    console.log(`   Address: ${result.address}`);
    console.log(`   Explorer: https://sepolia.etherscan.io/address/${result.address}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log("");
  });

  const verified = results.filter(r => r.status === 'verified' || r.status === 'already verified').length;
  const total = results.length;
  
  console.log(`📊 Verification complete: ${verified}/${total} contracts verified`);
}

if (require.main === module) {
  main()
    .then(() => {
      console.log("\n🎉 Verification process finished!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Verification failed:", error);
      process.exit(1);
    });
}

module.exports = main;
