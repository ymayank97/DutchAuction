
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

    function initialize(
        address _erc20TokenAddress, address _erc721TokenAddress, uint256 _nftTokenId, uint256 _reservePrice, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement,
        address ownerAddress) public initializer {
        __Ownable_init();
        erc20Token = IERC20(_erc20TokenAddress);
        erc721Token = IERC721(_erc721TokenAddress);
        nftTokenId = _nftTokenId;
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        transferOwnership(ownerAddress);
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

        uint256 currentOffer = calculateCurrentOffer();
        require(amount >= currentOffer, "Bid is lower than current offer");

        erc20Token.safeTransferFrom(msg.sender, address(this), amount);

    }

    function endAuction() public onlyOwner {
        require(startBlock != 0, "Auction has not started yet");
        require(!auctionClosed, "Auction has already closed");

        auctionClosed = true;
    }

    function calculateCurrentOffer() public view returns (uint256) {
        uint256 currentBlock = block.number;
        uint256 blocksElapsed = currentBlock - startBlock;
        uint256 currentOffer = reservePrice - (blocksElapsed * offerPriceDecrement);
        return currentOffer;
    }
}
