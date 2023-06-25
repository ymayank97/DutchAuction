# DutchAuction


This project asks you to build a decentralized application for a Dutch Auction. The project has multiple milestones, one due every week until the last class of the semester. Each milestone will build upon the work of previous milestones. As noted in the syllabus, you have seven late-days across all homeworks throughout the semester.


Version 1.0

Create a new directory in your Github repo called v1.0 and initialize a new hardhat project.
Create a new contract called BasicDutchAuction.sol that implements a Dutch auction called as described below.
Write test cases to thoroughly test your contracts. Generate a Solidity coverage report and commit it to your repository.

The BasicDutchAuction.sol contract works as follows:
The seller instantiates a DutchAuction contract to manage the auction of a single, physical item at a single auction event. The contract is initialized with the following parameters: 
reservePrice: the minimum amount of wei that the seller is willing to accept for the item 
numBlocksAuctionOpen: the number of blockchain blocks that the auction is open for
offerPriceDecrement: the amount of wei that the auction price should decrease by during each subsequent block. 
The seller is the owner of the contract. 
The auction begins at the block in which the contract is created. 
The initial price of the item is derived from reservePrice, numBlocksAuctionOpen, and  offerPriceDecrement: initialPrice = reservePrice + numBlocksAuctionOpen*offerPriceDecrement 
A bid can be submitted by either an externally-owned account or a contract account.
The first bid processed by the contract that sends wei greater than or equal to the current price is the  winner. The wei should be transferred immediately to the seller and the contract should not accept  any more bids. All bids besides the winning bid should be refunded immediately. 



Version 2.0
Read the ERC721 EIP and OpenZeppellin implementation.
Create a new directory in your Github repo called v2.0 and initialize a new hardhat project.
Copy over any files you can reuse from the previous versions of this project into the directory for this version.
Understand how the ERC721 contract works by downloading an off-the-shelf version from OpenZeppellin, and write test cases so you understand how to create NFT contracts, how to mint NFTs, and how to transfer them. ERC721 is the official name for Ethereum’s NFT contract specification.
To add contracts from OpenZeppellin into your project, definitely use npm to download them. The OpenZeppellin contracts have a lot of dependencies, and thus copying and pasting them will 1) take a lot of time, 2) will make it hard to upgrade to newer versions, 3) increase the vulnerability scope of your project, and 4) make it more likely for those contracts to get changed by you or your team.
Create a new contract called NFTDutchAuction.sol. It should have the same functionality as BasicDutchAuction.sol but it sells an NFT instead of a physical item. The constructor for the NFTDutchAuction.sol should be:
constructor(address erc721TokenAddress, uint256 _nftTokenId, uint256 _reservePrice, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement)
Write test cases to thoroughly test your contracts. Generate a Solidity coverage report and commit it to your repository under this version’s directory.

Version 3.0
Create a new directory in your Github repo called v3.0 and initialize a new hardhat project.
Copy over any files you can reuse from the previous versions of this project into the directory for this version.
Create a new contract called NFTDutchAuction_ERC20Bids.sol. It should have the same functionality as NFTDutchAuction.sol but accepts only ERC20 bids instead of Ether. 
The constructor for the NFTDutchAuction_ERC20Bids.sol should be: constructor(address erc20TokenAddress, address erc721TokenAddress, uint256 _nftTokenId, uint256 _reservePrice, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement)
Write test cases to thoroughly test your contracts. Generate a Solidity coverage report and commit it to your repository under this version’s directory.

Version 4.0
Add an upgrade proxy to make your NFTDutchAuction_ERC20Bids.sol upgradeable. You don’t need to make the NFT or ERC20 contracts upgradeable. Just the DutchAuction contract.
Read the documentation on upgradeable contracts
Use the UUPS proxy instead of a transparent proxy: https://docs.openzeppelin.com/contracts/4.x/api/proxy
Version 5.0
Read https://eips.ethereum.org/EIPS/eip-2612.
Read https://eips.ethereum.org/EIPS/eip-712
Add ERC20Permit functionality to your ERC20 implementation. See Openzeppellin’s implementation.
Write test cases to cover the permit functionality in the context of submitting a bid to your NFTDutchAuction_ERC20Bids.
Version 6.0
Create a new directory in your Github repo called v6.0 and initialize a new hardhat project.
Implement a ReactJS user interface for your BasicDutchAuction.sol. The UI should enable a user to:
Deploy a new BasicDutchAuction and specify all the parameters for its constructor.
Look up a specific BasicDutchAuction by its address, view important information about the contract, and 
Submit a bid
The UI should have three sections. Feel free to use the following layouts in your app, or something similar.
Section 1: Deployment
Inputs:
A textbox for each parameter in the constructor
A button called “Deploy”
Outputs:
A label with the address of the newly created BasicDutchAuction
Section 2: Look up info on an auction
Inputs:
A textbox for the address of a BasicDutchAction.
A button called “Show Info”
Outputs:
A label for each property of the BasicDutchAction:
Winner, if one already exists
Constructor parameters
Current price
Section 3: Submit a bid
Input: 
A textbox for the address of a BasicDutchAction.
A textbox for the bid
A button called “Bid”
Outputs:
A label indicating whether the bid was accepted as the winner or not
Suggestions:
You’ll not be evaluated on user experience, performance, or aesthetics. Just functionality.
Note that this project is a web3 application, and thus should not need a server.
You may use the following links as starting points for your implementation, but note that their ReactJS code is a lot more than what’s needed for this assignment. We suggest that you use it as an example to learn from, but that you actually implement your UI from scratch and only include the code you need from the example.
Read: https://support.chainstack.com/hc/en-us/articles/4408642503449-Using-MetaMask-with-a-Hardhat-node
Read: https://www.web3.university/article/how-to-build-a-react-dapp-with-hardhat-and-metamask
You may use this starter repo: 
https://github.com/ChainShot/hardhat-ethers-react-ts-starter
Instructions to get the app working:
cd hardhat-ethers-react-ts-starter
yarn install
yarn hardhat compile
cd frontend
yarn install
yarn start

Version 7.0
Deploy your Version 6.0 dapp on an Ethereum testnet.
This step will require getting test eth from a faucet.
Sometimes these faucets can be unreliable so you’ll have to keep searching online for a faucet that gives you enough eth to successfully deploy your contract.
Hardhat can deploy your contracts for you: https://hardhat.org/tutorial/deploying-to-a-live-network
Host your UI through IPFS. 
You will host your UI on your own machine, and you will use IPFS to enable others to access it through an ipfs:// url.
Get the CID of your build directory that contains your built UI, and prefix the CID with “ipfs://”.
For example if your CID is QmRgCTtKd91QkgoTiJQky57pCRda2drKEvTyFkUznaoKm3, the URL to access the content is ipfs://QmRgCTtKd91QkgoTiJQky57pCRda2drKEvTyFkUznaoKm3
Steps:
Generate build files for your UI
Install IPFS desktop and IPFS browser plugin.
Pin your UI build files to your IPFS Desktop node.
Add the IPFS url to your README.md file in your repo.
Use IPNS to generate a fixed name for your UI: https://docs.ipfs.tech/concepts/ipns/#mutability-in-ipfs
Present your fully functioning app to the TA:
Show that your contracts are deployed on a testnet
Show that your UI accessible by anyone through IPFS url
Show that users can interact with your UI through IPFS and the Metamask plugin by:
deploying a new BasicDutchAuction
submitting a winning bid


TODO: Add more versions based on these solidity patterns:
https://github.com/dragonfly-xyz/useful-solidity-patterns
