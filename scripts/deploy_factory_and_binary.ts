/// <reference types="@nomicfoundation/hardhat-ethers" />
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log("Deployer:", deployerAddress);

  // Deploy BinaryMarket implementation (template)
  const BinaryMarketFactory = await hre.ethers.getContractFactory("BinaryMarket");
  const binaryImpl = await BinaryMarketFactory.deploy();
  await binaryImpl.waitForDeployment();
  const binaryImplAddress = await binaryImpl.getAddress();
  console.log("BinaryMarket implementation:", binaryImplAddress);

  // Deploy MarketFactory
  const MarketFactoryFactory = await hre.ethers.getContractFactory("MarketFactory");
  const mf = await MarketFactoryFactory.deploy(deployerAddress);
  await mf.waitForDeployment();
  const mfAddress = await mf.getAddress();
  console.log("MarketFactory:", mfAddress);

  // Register template
  const templateId = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("BINARY"));
  const txReg = await mf.registerTemplate(templateId, binaryImplAddress, "Binary");
  await txReg.wait();
  console.log("Registered BINARY template");

  // Determine USDT address based on network
  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  const env = process.env;
  let collateral = env.COLLATERAL_TOKEN_ADDRESS;
  if (!collateral) {
    switch (chainId) {
      case 137: // polygon
        collateral = env.USDT_ADDRESS_POLYGON || env.NEXT_PUBLIC_USDT_ADDRESS_POLYGON;
        break;
      case 80002: // amoy
        collateral = env.USDT_ADDRESS_AMOY || env.NEXT_PUBLIC_USDT_ADDRESS_AMOY;
        break;
      case 11155111: // sepolia
        collateral = env.USDT_ADDRESS_SEPOLIA || env.NEXT_PUBLIC_USDT_ADDRESS_SEPOLIA;
        break;
      case 1337: // localhost
        collateral = env.USDT_ADDRESS_LOCALHOST || env.NEXT_PUBLIC_USDT_ADDRESS_LOCALHOST || env.COLLATERAL_TOKEN_ADDRESS;
        break;
      default:
        collateral = env.USDT_ADDRESS || env.NEXT_PUBLIC_USDT_ADDRESS || env.COLLATERAL_TOKEN_ADDRESS;
    }
  }

  if (!collateral) {
    console.error("Missing USDT collateral address env. Set COLLATERAL_TOKEN_ADDRESS or USDT_ADDRESS_*.");
    return;
  }

  const oracle = env.ORACLE_ADDRESS || deployerAddress;
  const feeBps = env.MARKET_FEE_BPS ? Number(env.MARKET_FEE_BPS) : 30; // 0.30%
  const now = Math.floor(Date.now() / 1000);
  const resolutionTime = env.MARKET_RESOLUTION_TS ? Number(env.MARKET_RESOLUTION_TS) : (now + 7 * 24 * 3600);
  const data = "0x"; // template-specific params (not used in BinaryMarket)

  // Create market
  const txCreate = await mf.createMarket(templateId, collateral, oracle, feeBps, resolutionTime, data);
  const receipt = await txCreate.wait();

  // Parse event
  const iface = mf.interface;
  const log = receipt.logs.find(l => {
    try { return iface.parseLog(l).name === "MarketCreated"; } catch (_) { return false; }
  });
  if (log) {
    const parsed = iface.parseLog(log);
    console.log("MarketCreated:", {
      marketId: parsed.args.marketId?.toString?.() ?? parsed.args[0].toString(),
      market: parsed.args.market ?? parsed.args[1],
      templateId: parsed.args.templateId ?? parsed.args[2],
      creator: parsed.args.creator ?? parsed.args[3],
      collateralToken: parsed.args.collateralToken ?? parsed.args[4],
      oracle: parsed.args.oracle ?? parsed.args[5],
      feeBps: parsed.args.feeBps?.toString?.() ?? parsed.args[6].toString(),
      resolutionTime: parsed.args.resolutionTime?.toString?.() ?? parsed.args[7].toString()
    });
  } else {
    console.log("Market created. Tx:", receipt.hash);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});