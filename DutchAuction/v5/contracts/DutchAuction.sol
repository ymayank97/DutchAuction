
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";


contract DutchAuction is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    using SafeERC20 for IERC20;
    IERC20 public erc20Token;
    IERC721 public erc721Token;
    uint256 public nftTokenId;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public startBlock;
    uint256 public endBlock;
    bool public auctionClosed;

    address public buyer;
    address public seller;

    function initialize(
        address _erc20TokenAddress, address _erc721TokenAddress, uint256 _nftTokenId, uint256 _reservePrice, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement ) public initializer {
        __Ownable_init();
        erc20Token = IERC20(_erc20TokenAddress);
        erc721Token = IERC721(_erc721TokenAddress);
        nftTokenId = _nftTokenId;
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;

        seller = payable(msg.sender);
    }

    function _authorizeUpgrade(address) internal view override onlyOwner {}

    function startAuction() public onlyOwner {
        require(!auctionClosed, "Auction has already closed");
        require(startBlock == 0, "Auction has already started");

        startBlock = block.number;
        endBlock = startBlock + numBlocksAuctionOpen;
        auctionClosed = false;
    }


    function placeBid(uint256 amount) public {
        
        require(!auctionClosed, "Auction has already closed");
        require(startBlock != 0, "Auction has not started yet");

        uint256 currentBlock = block.number;
        require(currentBlock < endBlock, "Auction has already ended");

        require(amount >= calculateCurrentOffer(), "Bid is lower than current offer");

        bool status =  erc20Token.transferFrom(msg.sender, seller, amount);
        
        require(status == true, "Failure in transfering ERC20 token");


        erc721Token.transferFrom(seller, msg.sender, nftTokenId);

        buyer = erc721Token.ownerOf(nftTokenId);
        
        auctionClosed = true;

    }


    function endAuction() public onlyOwner {
        require(startBlock != 0, "Auction has not started yet");
        require(!auctionClosed, "Auction has already closed");

        auctionClosed = true;
    }

    function calculateCurrentOffer() public view returns (uint256) {

        return (reservePrice - ((block.number  - startBlock) * offerPriceDecrement));
    }
}
