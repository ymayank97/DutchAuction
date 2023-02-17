// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC721.sol";

contract NFTDutchAuction {
    address public owner;
    address public erc721TokenAddress;
    uint256 public nftTokenId;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public startBlock;
    uint256 public endBlock;
    bool public auctionClosed;
    uint256 public highestOffer;
    address public highestBidder;
    mapping(address => uint256) public bids;

    event AuctionStarted(uint256 reservePrice, uint256 startBlock, uint256 endBlock);
    event HighestOfferIncreased(address bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);

    constructor(
        address _erc721TokenAddress,
        uint256 _nftTokenId,
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
    ) {
        owner = msg.sender;
        erc721TokenAddress = _erc721TokenAddress;
        nftTokenId = _nftTokenId;
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;

    }

    function startAuction() public {
        require(msg.sender == owner, "Only the owner can start the auction.");
        require(startBlock == 0, "Auction has already started.");
        startBlock = block.number;
        endBlock = startBlock + numBlocksAuctionOpen;
        auctionClosed = false;

        emit AuctionStarted(reservePrice, startBlock, endBlock);
    }

    function placeBid() public payable {
        require(startBlock != 0, "Auction has not yet started.");
        require(block.number <= endBlock, "Auction has ended.");
        require(msg.value > 0, "Bid amount must be greater than zero.");

        uint256  currentPrice = getCurrentPrice();
        require(msg.value > currentPrice, "Bid amount must be greater than current price.");


        // Update highest offer and bidder.
        highestOffer = msg.value;
        highestBidder = msg.sender;
        bids[highestBidder] = msg.value;

        emit HighestOfferIncreased(highestBidder, highestOffer);
    }

    function endAuction() public payable{
        require(msg.sender == owner, "Only the owner can end the auction.");
        require(!auctionClosed, "Auction has already been closed.");
        require(block.number > endBlock, "Auction has not yet ended.");

        uint256  currentPrice = getCurrentPrice();

        if (highestOffer >= currentPrice) {
            // Transfer NFT to highest bidder.
            ERC721 erc721 = ERC721(erc721TokenAddress);
            erc721.transferFrom(owner, highestBidder, nftTokenId);

            // Transfer ETH to owner.
            payable(owner).transfer(highestOffer);
            auctionClosed = true;

            emit AuctionEnded(highestBidder, highestOffer);
        }
        else {
            // Refund highest bidder.
            payable(highestBidder).transfer(highestOffer);
            auctionClosed = true;

            emit AuctionEnded(address(0), 0);
        }
    }

    function getCurrentPrice() internal view returns (uint256) {
      require(startBlock != 0, "Auction has not yet started.");
      require(block.number <= endBlock, "Auction has ended.");
      
      int256 currentPrice = int256(reservePrice - (block.number - startBlock) * offerPriceDecrement);

      return uint256(currentPrice);
      }
}