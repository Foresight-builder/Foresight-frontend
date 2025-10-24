import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Foresight contract...");

  const Foresight = await ethers.getContractFactory("Foresight");
  const foresight = await Foresight.deploy();

  await foresight.waitForDeployment();

  const address = await foresight.getAddress();
  console.log(`Foresight deployed to: ${address}`);

  // 保存部署信息到文件
  const fs = require("fs");
  const deploymentInfo = {
    network: "hardhat",
    contract: "Foresight",
    address: address,
    deployer: (await ethers.provider.getSigner()).address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment information saved to deployment.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});