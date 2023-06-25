# DutchAuction

This project aims to develop a decentralized application for a Dutch Auction. The project consists of multiple milestones, with one milestone due every week until the end of the semester. Each milestone builds upon the work completed in the previous milestones. As per the syllabus, you have a total of seven late-days that can be used for any homework throughout the semester.

## Version 1.0

1. Create a new directory in your Github repository called `v1.0` and initialize a new Hardhat project.
2. Implement a new contract named `BasicDutchAuction.sol` that follows the Dutch auction specifications described below.
3. Write comprehensive test cases to ensure the correctness of your contracts.
4. Generate a Solidity coverage report and commit it to your repository.

**Functionality of `BasicDutchAuction.sol` contract:**

- The `DutchAuction` contract is instantiated by the seller to manage the auction of a single physical item at a specific event.
- Initialize the contract with the following parameters:
  - `reservePrice`: The minimum amount of wei that the seller is willing to accept for the item.
  - `numBlocksAuctionOpen`: The number of blockchain blocks for which the auction remains open.
  - `offerPriceDecrement`: The amount of wei by which the auction price should decrease in each subsequent block.
- The seller acts as the owner of the contract.
- The auction begins at the block in which the contract is created.
- The initial price of the item is calculated as follows:
  - `initialPrice = reservePrice + numBlocksAuctionOpen * offerPriceDecrement`
- Bids can be submitted by both externally-owned accounts and contract accounts.
- The first bid processed by the contract, which sends wei greater than or equal to the current price, becomes the winner.
- The wei from the winning bid is immediately transferred to the seller, and the contract no longer accepts any more bids.
- All bids, except the winning bid, are refunded immediately.

## Version 2.0

1. Create a new directory in your Github repository called `v2.0` and initialize a new Hardhat project.
2. Copy any reusable files from the previous versions into this directory.
3. Study the ERC721 EIP and OpenZeppelin implementation.
4. Download a pre-built ERC721 contract from OpenZeppelin to understand how to create NFT contracts, mint NFTs, and transfer them.
5. Use npm to download the required contracts from OpenZeppelin, as they have many dependencies. Copying and pasting them may lead to issues in the long run.
6. Develop a new contract named `NFTDutchAuction.sol` with the same functionality as `BasicDutchAuction.sol`, but for selling an NFT instead of a physical item.
7. Define the constructor for `NFTDutchAuction.sol` as follows:
   - `constructor(address erc721TokenAddress, uint256 _nftTokenId, uint256 _reservePrice, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement)`
8. Write comprehensive test cases to ensure the correctness of your contracts.
9. Generate a Solidity coverage report and commit it to your repository under this version's directory.

## Version 3.0

1. Create a new directory in your Github repository called `v3.0` and initialize a new Hardhat project.
2. Copy any reusable files from the previous versions into this directory.
3. Develop a new contract named `NFTDutchAuction_ERC20Bids.sol` with the same functionality as `NFTDutchAuction.sol`, but only accepting ERC20 bids instead of Ether.
4.

 Define the constructor for `NFTDutchAuction_ERC20Bids.sol` as follows:
   - `constructor(address erc20TokenAddress, address erc721TokenAddress, uint256 _nftTokenId, uint256 _reservePrice, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement)`
5. Write comprehensive test cases to ensure the correctness of your contracts.
6. Generate a Solidity coverage report and commit it to your repository under this version's directory.

## Version 4.0

1. Add an upgrade proxy to make your `NFTDutchAuction_ERC20Bids.sol` contract upgradeable. Note that only the DutchAuction contract needs to be upgradeable; the NFT and ERC20 contracts can remain as they are.
2. Refer to the documentation on upgradeable contracts and utilize the UUPS proxy instead of a transparent proxy. More details can be found at: [https://docs.openzeppelin.com/contracts/4.x/api/proxy](https://docs.openzeppelin.com/contracts/4.x/api/proxy)

## Version 5.0

1. Read the EIP-2612 (https://eips.ethereum.org/EIPS/eip-2612) and EIP-712 (https://eips.ethereum.org/EIPS/eip-712) proposals.
2. Add ERC20Permit functionality to your ERC20 implementation by following OpenZeppelin's implementation.
3. Write test cases to cover the permit functionality in the context of submitting a bid to your `NFTDutchAuction_ERC20Bids` contract.

## Version 6.0

1. Create a new directory in your Github repository called `v6.0` and initialize a new Hardhat project.
2. Implement a ReactJS user interface for your `BasicDutchAuction.sol` contract.
3. The user interface should enable users to:
   - Deploy a new `BasicDutchAuction` and specify all the constructor parameters.
   - Look up a specific `BasicDutchAuction` by its address and view important information about the contract.
   - Submit a bid.
4. The user interface should consist of three sections. You can use the suggested layouts or design something similar:
   - **Section 1: Deployment**
     - Inputs:
       - Textboxes for each parameter in the constructor.
       - A button labeled "Deploy."
     - Outputs:
       - A label displaying the address of the newly created `BasicDutchAuction`.
   - **Section 2: Look up info on an auction**
     - Inputs:
       - A textbox for the address of a `BasicDutchAuction`.
       - A button labeled "Show Info."
     - Outputs:
       - Labels for each property of the `BasicDutchAuction`, including the winner (if one exists), constructor parameters, and current price.
   - **Section 3: Submit a bid**
     - Inputs:
       - A textbox for the address of a `BasicDutchAuction`.
       - A textbox for entering the bid.
       - A button labeled "Bid."
     - Outputs:
       - A label indicating whether the bid was accepted as the winner or not.
5. Please note that user experience, performance, and aesthetics will not be evaluated. Focus on implementing the functionality.
6. As this project is a web3 application, there is no need for a server.
7. You can use the provided links as starting points for your implementation. However, it is recommended to implement your UI from scratch and include only the necessary code from the examples.

## Version 7.0

1. Deploy your Version 6.0 dapp on an Ethereum test

net.
   - This step requires obtaining test ETH from a faucet. Faucets may sometimes be unreliable, so you may need to search online for a faucet that provides sufficient ETH to deploy your contract successfully.
   - Hardhat can deploy your contracts for you. Refer to the following link for instructions: [https://hardhat.org/tutorial/deploying-to-a-live-network](https://hardhat.org/tutorial/deploying-to-a-live-network)
2. Host your UI through IPFS.
   - Host your UI on your local machine and use IPFS to enable others to access it through an `ipfs://` URL.
   - Generate the CID of your build directory containing the UI and prefix the CID with `ipfs://`.
   - For example, if your CID is `QmRgCTtKd91QkgoTiJQky57pCRda2drKEvTyFkUznaoKm3`, the URL to access the content is `ipfs://QmRgCTtKd91QkgoTiJQky57pCRda2drKEvTyFkUznaoKm3`.
3. Perform the following steps:
   - Generate build files for your UI.
   - Install IPFS desktop and IPFS browser plugin.
   - Pin your UI build files to your IPFS Desktop node.
   - Add the IPFS URL to your README.md file in your repository.
4. Use IPNS to generate a fixed name for your UI. Refer to the following link for more information: [https://docs.ipfs.tech/concepts/ipns/#mutability-in-ipfs](https://docs.ipfs.tech/concepts/ipns/#mutability-in-ipfs)
5. Present your fully functioning app to the TA:
   - Show that your contracts are deployed on a testnet.
   - Demonstrate that your UI is accessible by anyone through the IPFS URL.
   - Show that users can interact with your UI through IPFS and the MetaMask plugin by deploying a new `BasicDutchAuction` and submitting a winning bid.

### Additional Versions

You may consider adding more versions based on the provided Solidity patterns at the following repository: [https://github.com/dragonfly-xyz/useful-solidity-patterns](https://github.com/dragonfly-xyz/useful-solidity-patterns)
