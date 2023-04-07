
import { HardhatUserConfig } from 'hardhat/config';

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
import '@nomiclabs/hardhat-ethers';


require('dotenv').config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;


const config: HardhatUserConfig = {

  solidity: "0.8.4",
  paths:{
    artifacts:'./frontend/src/artifacts',
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      // @ts-ignore
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  }
};

export default config;
