import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { DutchAuction , MyERC20Token } from '../typechain-types';
import 'solidity-coverage';


async function getPermitSignature(signer:any, token:MyERC20Token, spender:string, value:BigNumber, deadline:BigNumber) {

  const [nonce, name, version, chainId] = await Promise.all([
      token.nonces(signer.address),token.name(),"1",signer.getChainId(),])

  return ethers.utils.splitSignature(
      await signer._signTypedData(
          {name,version,chainId,verifyingContract: token.address,},
          {
              Permit: [
                  { name: "owner",type: "address", },
                  { name: "spender",type: "address", },
                  { name: "value",type: "uint256",},
                  { name: "nonce",type: "uint256",},
                  { name: "deadline",type: "uint256",},],},
          {
              owner: signer.address,spender,value,nonce,
deadline,
          }
      )
  )
}


describe('Token Contract', () => {
  let dutchAuction: DutchAuction;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any;
  let erc20: Contract;
  let erc721: Contract;

  beforeEach(async () => {

    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  
    const erc20Token = await ethers.getContractFactory('MyERC20Token');
    erc20 = await erc20Token.deploy('1000');
    await erc20.deployed();
    await erc20.connect(owner).buy(300,{value: 30000});
    await erc20.connect(addr1).buy(100,{value: 10000});

   
    const erc721Token = await ethers.getContractFactory('MyERC21Token');
    erc721 = await erc721Token.deploy(10);
    await erc721.deployed();
    await erc721.mint(owner.address);


    // deploy the DutchAuction contract using the upgradeable proxy
    const DutchAuctionInstance = await ethers.getContractFactory("DutchAuction");
    dutchAuction = await upgrades.deployProxy(
      DutchAuctionInstance,
      [erc20.address,erc721.address, 1,100,10,10],
      { initializer: "initialize",  unsafeAllowCustomTypes: true, kind: "uups"}
    );

    await erc721.approve(dutchAuction.address, 1 );


  });

  

  describe("Deployment", function () {

		it("Should assign the total supply of tokens to the owner", async function () {
			const ownerBalance = await erc20.balanceOf(owner.address);
      const addr1Balance = await erc20.balanceOf(addr1.address);
			expect(await erc20.totalSupply()).to.equal(ownerBalance.add(addr1Balance) );
		});

    it("check NFT supply", async function () {

      expect(await erc721.maxSupply()).to.equal(10);
      expect(await erc721.currSupply()).to.equal(1);

  });

  it("check token supply", async function () {

    expect(await erc20.maxSupply()).to.equal(1000);
    expect(await erc20.totalSupply()).to.equal(400);

  });

  it("Safe Mint NFT", async function () {

    expect(await erc721.mint(owner.address));
    expect(await erc721.balanceOf(owner.address)).to.equal(2);
    expect(await erc721.ownerOf(2)).to.equal(owner.address);
  });

  it("Max Supply Mint NFT ", async function () {

    await erc721.mint(owner.address);
    await erc721.mint(owner.address);
    await erc721.mint(owner.address);
    await erc721.mint(owner.address);
    await erc721.mint(owner.address);
    await erc721.mint(owner.address);
    await erc721.mint(owner.address);
    await erc721.mint(owner.address);
    await erc721.mint(owner.address);
    await expect( erc721.mint(owner.address)).to.be.revertedWith("already minted max");
  });

  
  it("Max Supply Mint Token", async function () {

    await expect( erc20.buy(1100,{value : 1100000})).to.be.revertedWith("Limit exceeded for minting");
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

    it('Should mint a new token and increment tokenIds', async function () {
      // Call the `mint` function on the `erc721` contract, passing the address `addr1.address` as the `to` parameter.
      await erc721.connect(owner).mint(addr1.address,{value: 2});

      // Assert that the `ownerOf` the newly minted token is `addr1.address`.
      expect(await erc721.ownerOf(erc721.getTokenIds())).to.equal(addr1.address);
    
      // Assert that the value of `_tokenIds.current()` has been incremented to `1`.
      expect(await erc721.getTokenIds()).to.equal(2);
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
        expect(addr1Balance).to.equal(150);
  
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
          erc20.connect(addr2).transfer(owner.address, 1)
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
        expect(addr1Balance).to.equal(200);
  
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

    describe('Permit', () => {

      it("token Allowance Check", async function () {

        const deadline = ethers.constants.MaxUint256;

        const { v, r, s } = await getPermitSignature(
            addr1,
            erc20,
            dutchAuction.address,
            await erc20.balanceOf(addr1.address),
            deadline
        )

        await erc20.permit(
            addr1.address,
            dutchAuction.address,
            erc20.balanceOf(addr1.address),
            deadline,
            v,r,s
        )

        expect(await erc20.allowance(addr1.address,dutchAuction.address)).to.equal(await erc20.balanceOf(addr1.address));

    });

    it("Successful Bid and balance checks", async function () {

      expect(await erc721.balanceOf(owner.address)).to.equal(1);
      expect(await erc721.balanceOf(addr1.address)).to.equal(0);

      await erc20.connect(owner).transfer(addr1.address, 200);
      
      expect(await erc20.balanceOf(addr1.address)).to.equal(300);

      const deadline = ethers.constants.MaxUint256

      const { v, r, s } = await getPermitSignature(
          addr1,
          erc20,
          dutchAuction.address,
          await erc20.balanceOf(addr1.address),
          deadline
      )

      await erc20.permit(
          addr1.address,
          dutchAuction.address,
          erc20.balanceOf(addr1.address),
          deadline,
          v,r,s
      )
      
      
      await dutchAuction.connect(owner).startAuction();
      expect(await dutchAuction.connect(addr1).placeBid(100));
      
      
      expect(await erc721.balanceOf(addr1.address)).to.equal(1);      
      expect(await erc721.balanceOf(owner.address)).to.equal(0);

      expect(await dutchAuction.buyer()).to.equal(addr1.address);
      expect(await dutchAuction.auctionClosed()).to.equal(true);
      expect(await erc20.balanceOf(addr1.address)).to.equal(200);
      expect(await erc20.balanceOf(owner.address)).to.equal(200);

  });

  it("You already bought this product", async function () {

      const deadline = ethers.constants.MaxUint256

      const { v, r, s } = await getPermitSignature(
          addr1,
          erc20,
          dutchAuction.address,
          await erc20.balanceOf(addr1.address),
          deadline
      )

      await erc20.permit(
          addr1.address,
          dutchAuction.address,
          erc20.balanceOf(addr1.address),
          deadline,
          v,r,s
      )
      await dutchAuction.connect(owner).startAuction();

      expect(await dutchAuction.connect(addr1).placeBid(100)).to.be.revertedWith("You already bought this product");

  });
     
    });
});
