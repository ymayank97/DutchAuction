import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from "hardhat";
import { DutchAuction  } from '../typechain';
import 'solidity-coverage';

describe('Dutch Auction Contract', () => {
    let dutchAuction: DutchAuction;
    let owner: any;
    let addr1: any;
    let addr2: any;
    let addrs: any;
    let erc20: Contract;
    let erc721: Contract;

    beforeEach(async () => {
        // Get the ContractFactory and Signers here.
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // deploy the DutchAuction contract
        const DutchAuctionInstance = await ethers.getContractFactory("DutchAuction");
        dutchAuction = await DutchAuctionInstance.deploy(100,10,10);
        await dutchAuction.deployed();

    });

    
    describe("Deployment", function () {

        it("Should set the right owner", async function () {

            expect(await dutchAuction.seller()).to.equal(owner.address);
        });
    
    
        it("should initialize with correct values", async () => {

            const reservePrice = await dutchAuction.reservePrice();
            const numBlocksAuctionOpen = await dutchAuction.numBlocksAuctionOpen();
            const offerPriceDecrement = await dutchAuction.offerPriceDecrement();
    
            expect(reservePrice.toNumber()).to.equal(100);
            expect(numBlocksAuctionOpen.toNumber()).to.equal(10);
            expect(offerPriceDecrement.toNumber()).to.equal(10);
        });
    

    });

    describe("Transactions", function () {
    
        it('Check seller is owner', async function () {
        expect(await dutchAuction.seller()).to.equal(owner.address);
        });
    
        it('should start the auction', async () => {
            await dutchAuction.connect(owner);
            const startBlock = await dutchAuction.startBlock();
            expect(startBlock).to.not.equal(0);
        });

        it('Should not allow bid lower than current offer', async function () {
            
            await expect(dutchAuction.connect(addr1).placeBid({value:100})).to.be.revertedWith('Bid is lower than current offer');
        });

        it("Product is still available for bid", async function () {
      
            expect(await dutchAuction.buyer()).to.equal(ethers.constants.AddressZero);
      
        });
      
        it("Auction Status is Open", async function () {
      
            expect(await dutchAuction.auctionOpenStatus()).to.equal(true);
      
        });
      
      
          it("Number of rounds", async function () {
            const hashOfTx = dutchAuction.deployTransaction.hash;
            const initBlock = (await dutchAuction.provider.getTransactionReceipt(hashOfTx)).blockNumber;
            const currentBlock = await ethers.provider.getBlockNumber();
            expect(10).to.greaterThanOrEqual(currentBlock-initBlock);
      
          });
      
      
        it("allows successful bid and wallet balance checks", async function () {
            const ownerBalanceBefore = await ethers.provider.getBalance(await owner.getAddress());
            // console.log('before bid', await dutchAuction.auctionOpenStatus());
            // Place a bid
            await dutchAuction.connect(addr2).placeBid({value:300});
            // console.log('after bid',await dutchAuction.auctionOpenStatus());
        
            // Check buyer address, auction status, and current offer
            expect(await dutchAuction.buyer()).to.equal(await addr2.getAddress());
            expect(await dutchAuction.auctionOpenStatus()).to.equal(false);
            expect(await dutchAuction.calculateCurrentOffer()).to.equal(190);
        
            // Check owner's balance
            const ownerBalanceAfter = await ethers.provider.getBalance(await owner.getAddress());
            const expectedBalanceDifference = 300;
            const actualBalanceDifference = ownerBalanceAfter.sub(ownerBalanceBefore).toNumber();
            expect(actualBalanceDifference).to.be.closeTo(expectedBalanceDifference, expectedBalanceDifference * 0.01);
        });
      
        it("You already bought this product", async function () {
      
            expect(await dutchAuction.connect(addr2).placeBid({value:300})).to.be.revertedWith("You already bought this product");
            // console.log(await dutchAuction.auctionOpenStatus());
        });
      
          

    });

});