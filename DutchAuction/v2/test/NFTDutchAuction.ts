import { expect } from "chai";
import { ethers } from "hardhat";
import { NFTDutchAuction } from "../typechain-types/NFTDutchAuction";
import 'solidity-coverage';

const { advanceBlockTo, getBlockNumber } = require("@nomicfoundation/hardhat-network-helpers");

describe("NFTDutchAuction", function () {
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any;
  let nftAuction: NFTDutchAuction;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    nftAuction = await(await ethers.getContractFactory("NFTDutchAuction")).deploy(owner.address, 0, 1, 10, 1 );
  });

  it("Should start the auction", async function () {
    await nftAuction.connect(owner).startAuction();
    const startBlock = await nftAuction.startBlock();
    const endBlock = await nftAuction.endBlock();

    expect(startBlock.toNumber()).to.be.above(0);
    expect(endBlock.toNumber()).to.equal(startBlock.toNumber() + 10);
  });

  it("Should not allow non-owner to start the auction", async function () {
    await expect(nftAuction.connect(addr1).startAuction()).to.be.revertedWith(
      "Only the owner can start the auction."
    );
  });

  it("Should not allow auction to start if it has already started", async function () {
    await nftAuction.connect(owner).startAuction();
    await expect(nftAuction.connect(owner).startAuction()).to.be.revertedWith(
      "Auction has already started."
    );
  });

  it("Should place a bid", async function () {
    await nftAuction.connect(owner).startAuction();
    await nftAuction.connect(addr1).placeBid({ value: 1 });

    const highestBidder = await nftAuction.highestBidder();
    const highestOffer = await nftAuction.highestOffer();
    const addr1Bid = await nftAuction.bids(addr1.address);

    expect(highestBidder).to.equal(addr1.address);
    expect(highestOffer.toNumber()).to.equal(1);
    expect(addr1Bid.toNumber()).to.equal(1);
  });

  it("Should not allow bid if auction has not started", async function () {
    await expect(nftAuction.connect(addr1).placeBid({ value: 1 })).to.be.revertedWith(
      "Auction has not yet started."
    );
  });

  it('Should not allow bid if auction has ended', async function () {
    await nftAuction.connect(owner).startAuction();

    const startBlock = await ethers.provider.getBlockNumber();

    await advanceBlockTo(startBlock + 50 - 2);

    await expect(nftAuction.connect(addr1).placeBid({ value: 1 })).to.be.revertedWith(
      'Auction has ended.'
    );
  });



  async function advanceBlockTo(target: number) {
    for (let i = await ethers.provider.getBlockNumber(); i < target; i++) {
      await ethers.provider.send('evm_mine', []);
    }
  }

});