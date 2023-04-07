# Dutch Auction Contract

## Introduction

This is a Dutch Auction smart contract hosted on Testnet Sepolia. The contract is designed to help users auction off their items to the highest bidder.

## How to Use

To use this contract, you need to have a wallet connected to Testnet Sepolia. You can then deploy the contract from your wallet, set the parameters for the auction, and start accepting bids from other users.

### Creating a new Hardhat project

```bash
mkdir dutch-auction
cd dutch-auction
npm init
npm install --save-dev hardhat
npx hardhat
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

#### upgrades plugin

npm install @openzeppelin/hardhat-upgrades

#### Open zeppelin contracts

npm install @openzeppelin/contracts

### Compiling Smart Contracts

npx hardhat compile

### Testing Smart Contracts

npx hardhat test

### Deploying Smart Contracts

npx hardhat run scripts/deploy.js --network localhost

### Deploying Smart Contracts to Sepolia Testnet

npx hardhat run scripts/deploy.js --network sepolia

### Deploying UI on IPFS

npm install -g ipfs-deploy
ipfs-deploy -p pinata -d build

## User Interface

The user interface for this contract is deployed on IPFS. You can access the UI by visiting the following URL: `ipfs://QmXV3JhG ... 9V37Ou` . The UI allows you to interact with the contract using a web interface. It provides a user-friendly way to manage your auctions and accept bids from other users.

## Contract Code

The code for this contract is available in the `contract/` directory of this repository. It is written in Solidity and can be compiled using the Truffle framework. The contract implements the Dutch Auction algorithm, which starts the bidding at a high price and gradually decreases the price until it reaches a point where a bidder accepts it. The auction ends when either the highest bid is accepted or the time limit for the auction is reached.

## Contributors

This contract was created by Mayank Yadav. If you would like to contribute to this project, please feel free to fork the repository and submit a pull request.
