// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract MyERC20Token is ERC20, ERC20Permit {

    uint256 public maxSupply;

    constructor(uint256 maxSup) ERC20("My ERC20 Token", "MERC20") ERC20Permit("My ERC20 Token") {
        maxSupply = maxSup;
    }


    function mint(address buyer, uint256 currSupply) internal {

        require(currSupply < maxSupply, "Limit exceeded for minting");
        // Mint the tokens
        _mint(buyer, currSupply );
    }

    function buy(uint tokensToBuy) payable public {
        // calculate total Amount
        uint totalAmount = tokensToBuy * 100;
        require(msg.value >= totalAmount , "Not enough Ether sent");
        // mint Tokens to msg.sender
        mint(msg.sender, tokensToBuy);
    }
    
}