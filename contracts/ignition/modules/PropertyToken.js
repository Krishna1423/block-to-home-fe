// Ignition module for deploying PropertyToken contract
// This is used for Polkadot Hub deployment

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("PropertyTokenModule", (m) => {
  // Get the deployer account as the initial owner
  const deployer = m.getAccount(0);

  // Deploy PropertyToken contract
  const propertyToken = m.contract("PropertyToken", [deployer]);

  return { propertyToken };
});

