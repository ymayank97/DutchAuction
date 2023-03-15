
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require('solidity-coverage');

const config: HardhatUserConfig = {
  solidity: "0.8.18",
};

export default config;
