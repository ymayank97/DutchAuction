import { expect } from 'chai';
import { Contract } from 'ethers';
import { DutchAuction } from '../typechain-types';
import 'solidity-coverage';

describe('Token Contract', () => {
  let dutchAuction: DutchAuction;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any;
  let erc20: Contract;
  let erc721: Contract;

  beforeEach(async () => {
    const totalSupply = (100).toString()
    const erc20Token = await ethers.getContractFactory('MyERC20Token');
    erc20 = await erc20Token.deploy(ethers.utils.parseEther(totalSupply));
    await erc20.deployed();

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    const erc721Token = await ethers.getContractFactory('MyERC21Token');
    erc721 = await erc721Token.deploy();
    await erc721.deployed();

    const reservePrice = ethers.utils.parseEther('100');
    const numBlocksAuctionOpen = 10;
    const offerPriceDecrement = ethers.utils.parseEther('10');

    // deploy the DutchAuction contract using the upgradeable proxy
    const DutchAuctionInstance = await ethers.getContractFactory("DutchAuction");
    dutchAuction = await upgrades.deployProxy(
      DutchAuctionInstance,
      [erc20.address,erc721.address, 1,reservePrice,numBlocksAuctionOpen,offerPriceDecrement,owner.address],
      { initializer: "initialize",  unsafeAllowCustomTypes: true, kind: "uups"}
    );
 
  });

  

  describe("Deployment", function () {

		it("Should assign the total supply of tokens to the owner", async function () {
			const ownerBalance = await erc20.balanceOf(owner.address);
			expect(await erc20.totalSupply()).to.equal(ownerBalance);
		});
	});

  describe("Transactions", function () {
    it('Should set the name and symbol of the token', async function () {
      expect(await erc721.name()).to.equal('My ERC21 Token');
      expect(await erc721.symbol()).to.equal('MERC21');
    });

    it('Should set the owner of the contract', async function () {
      expect(await erc721.owner()).to.equal(owner.address);
    });

    it('Should mint a new token', async function () {
      await erc721.connect(owner).mint(addr1.address, 1);
      expect(await erc721.ownerOf(1)).to.equal(addr1.address);
    });

    it('Should prevent minting the same token twice', async function () {
      await erc721.connect(owner).mint(addr1.address, 3);
      await expect(erc721.connect(owner).mint(addr2.address, 3)).to.be.revertedWith('ERC721: token already minted');
    });

    it('Check seller is owner', async function () {
      expect(await dutchAuction.owner()).to.equal(owner.address);
  });

	});

  describe("Dutch Auction", function () {

   
      it('should start the auction', async () => {
        await dutchAuction.connect(owner).startAuction();
        const startBlock = await dutchAuction.startBlock();
        expect(startBlock).to.not.equal(0);
      });


      it("Should not allow non-owner to start the auction", async function () {
        await expect(dutchAuction.connect(addr1).startAuction()).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
    
      it("Should not allow auction to start if it has already started", async function () {
        await dutchAuction.connect(owner).startAuction();
        await expect(dutchAuction.connect(owner).startAuction()).to.be.revertedWith(
          "Auction has already started"
        );
      });
    
      it("Should not allow bid if auction has not started", async function () {
        await expect(dutchAuction.connect(addr1).placeBid(1)).to.be.revertedWith(
          "Auction has not started yet"
        );
      });
    
      it('Should not allow bid lower than current offer', async function () {
        await dutchAuction.connect(owner).startAuction();
    
        await expect(dutchAuction.connect(addr1).placeBid(1)).to.be.revertedWith(
          'Bid is lower than current offer'
        );
      });

      it("Should transfer tokens between accounts", async function () {
        // Transfer 50 tokens from owner to addr1
        await erc20.transfer(addr1.address, 50);
        const addr1Balance = await erc20.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(50);
  
        // Transfer 50 tokens from addr1 to addr2
        // We use .connect(signer) to send a transaction from another account
        await erc20.connect(addr1).transfer(addr2.address, 50);
        const addr2Balance = await erc20.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(50);
      });
  
      it("Should fail if sender doesn’t have enough tokens", async function () {
        const initialOwnerBalance = await erc20.balanceOf(owner.address);
  
        // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
        // `require` will evaluate false and revert the transaction.
        await expect(
          erc20.connect(addr1).transfer(owner.address, 1)
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  
        // Owner balance shouldn't have changed.
        expect(await erc20.balanceOf(owner.address)).to.equal(
          initialOwnerBalance
        );
      });
  
      it("Should update balances after transfers", async function () {
        const initialOwnerBalance = await erc20.balanceOf(owner.address);
  
        // Transfer 100 tokens from owner to addr1.
        await erc20.transfer(addr1.address, 100);
  
        // Transfer another 50 tokens from owner to addr2.
        await erc20.transfer(addr2.address, 50);
  
        // Check balances.
        const finalOwnerBalance = await erc20.balanceOf(owner.address);
        expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));
  
        const addr1Balance = await erc20.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(100);
  
        const addr2Balance = await erc20.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(50);
      });

      it("should get the current price", async () => {
        await dutchAuction.connect(owner).startAuction();
        const reservePrice = await dutchAuction.reservePrice();
        const offerPriceDecrement = await dutchAuction.offerPriceDecrement();
        const numBlocksAuctionOpen = await dutchAuction.numBlocksAuctionOpen();
        const startBlock = await dutchAuction.startBlock();
        
        const currentBlockNumber = await ethers.provider.getBlockNumber();
        const blocksPassed = currentBlockNumber - startBlock.toNumber();
        const currentPrice = reservePrice.sub(offerPriceDecrement.mul(blocksPassed));
        
        expect(await dutchAuction.calculateCurrentOffer()).to.equal(currentPrice);
      });
    
      it("should not allow non-owner to end the auction", async () => {
        await dutchAuction.connect(owner).startAuction();
        await expect(dutchAuction.connect(addr1).endAuction()).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });

      it("should not allow to end the auction again", async () => {
        await dutchAuction.connect(owner).startAuction();
        await expect(dutchAuction.connect(owner).endAuction());
        await expect(dutchAuction.connect(owner).endAuction()).to.be.revertedWith(
          "Auction has already closed"
        );
      });
    
      it("should not allow the auction to end if it has not started", async () => {
        await expect(dutchAuction.connect(owner).endAuction()).to.be.revertedWith(
          "Auction has not started yet"
        );
      });

    });


});
