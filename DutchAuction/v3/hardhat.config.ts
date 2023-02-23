import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('solidity-coverage');

const config: HardhatUserConfig = {
  solidity: "0.8.17",
};

export default config;
