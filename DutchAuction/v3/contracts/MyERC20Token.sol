// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20Token is ERC20 {
    constructor(uint256 totalSupply) ERC20("My ERC20 Token", "MERC20") {
        _mint(msg.sender, totalSupply); 
    }
}