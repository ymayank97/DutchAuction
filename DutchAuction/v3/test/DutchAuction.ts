import { expect } from 'chai';
import { ethers } from 'hardhat';
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
    const totalSupply = (10 ** 9).toString()
    const erc20Token = await ethers.getContractFactory('MyERC20Token');
    erc20 = await erc20Token.deploy(ethers.utils.parseEther(totalSupply));
    await erc20.deployed();

    const erc721Token = await ethers.getContractFactory('MyERC21Token');
    const erc721 = await erc721Token.deploy();
    await erc721.deployed();

    const reservePrice = ethers.utils.parseEther('10');
    const numBlocksAuctionOpen = 5;
    const offerPriceDecrement = ethers.utils.parseEther('1');

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    dutchAuction = await ethers.getContractFactory('DutchAuction')
      .then(factory => factory.deploy(
        erc20.address,
        erc721.address,
        1,
        reservePrice,
        numBlocksAuctionOpen,
        offerPriceDecrement,
      ));
    await dutchAuction.deployed();
  });

  

  describe("Deployment", function () {

		it("Should assign the total supply of tokens to the owner", async function () {
			const ownerBalance = await erc20.balanceOf(owner.address);
			expect(await erc20.totalSupply()).to.equal(ownerBalance);
		});
	});

  describe("Transactions", function () {
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

    });


});
