const { ethers } = require("hardhat");

async function main() {
  const SIGNER_ADDRESS = "0xd24fD54959A2303407505dC602e94BCdA5F4AcDD"; 

  const network = await ethers.provider.getNetwork();
  console.log(`Deploying ERC7827 to ${network.name}...`);
  console.log("Authorized Signer:", SIGNER_ADDRESS);

  const ERC7827 = await ethers.getContractFactory("ERC7827");
  const contract = await ERC7827.deploy(SIGNER_ADDRESS);

  await contract.waitForDeployment();

  console.log(`ERC7827 deployed to: ${await contract.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});