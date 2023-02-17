
const { expect } = require("chai");

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");


describe("Token contract", function () {
  
  async function deployTokenFixture() {

    const Token = await ethers.getContractFactory("Token");
    const [owner, buyer1, buyer2] = await ethers.getSigners();


    const hardhatToken = await Token.deploy(100, 20, 1);

    await hardhatToken.deployed();

    return { Token, hardhatToken, owner, buyer1, buyer2 };
  }


  describe("Deployment", function () {
    
    it("Should set the right owner", async function () {
     
      const { hardhatToken, owner } = await loadFixture(deployTokenFixture);

      expect(await hardhatToken.owner()).to.equal(owner.address);
    });


    it("should initialize with correct values", async () => {

      const { hardhatToken, owner } = await loadFixture(deployTokenFixture);

      const reservePrice = await hardhatToken.reservePrice();
      const numBlocksAuctionOpen = await hardhatToken.numBlocksAuctionOpen();
      const offerPriceDecrement = await hardhatToken.offerPriceDecrement();

      expect(reservePrice.toNumber()).to.equal(100);
      expect(numBlocksAuctionOpen.toNumber()).to.equal(20);
      expect(offerPriceDecrement.toNumber()).to.equal(1);
    });


  });

  describe("Transactions", function () {


    it("should allow a buyer to place a bid", async () => {

      const { hardhatToken, owner, buyer1 } = await loadFixture(deployTokenFixture);

      const currPrice = await hardhatToken.initPrice();
      await hardhatToken.connect(buyer1).bid( currPrice );

      expect(buyer1.address).to.equal(await hardhatToken.bidWinner());
    });


    it("should not allow the bidder to place a bid less than current amount", async () => {
      const { hardhatToken } = await loadFixture(deployTokenFixture);

      const currPrice = await hardhatToken.currPrice();
      expect(hardhatToken.bid(currPrice.sub(21))).to.be.rejected;

    });


    it("should not allow the bidder to place a bid after successful bid by other user", async () => {
      const { hardhatToken, buyer1, buyer2 } = await loadFixture(deployTokenFixture);

      const currPrice = await hardhatToken.initPrice();
      await hardhatToken.connect(buyer1).bid( currPrice );

      const winner = await hardhatToken.bidWinner();
      expect(winner).to.equal(buyer1.address); 

      await expect( hardhatToken.connect(buyer2).bid( currPrice )).eventually.to.rejectedWith(Error, "VM Exception while processing transaction: reverted with reason string 'Auction has already ended.'")

    });


    it("block should increment after every bid request ", async () => {
      const { hardhatToken, buyer1, buyer2 } = await loadFixture(deployTokenFixture);

      const currPrice = await hardhatToken.initPrice();
      await hardhatToken.connect(buyer1).bid( currPrice );
      const winner = await hardhatToken.bidWinner();

      expect(await hardhatToken.startBlock()).to.equal(2);

    });

  });
});