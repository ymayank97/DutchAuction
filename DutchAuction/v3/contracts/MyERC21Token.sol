// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyERC21Token is ERC721, Ownable {
    constructor() ERC721("My ERC21 Token", "MERC21") {}

    function mint(address to, uint256 tokenId) public  {
        _safeMint(to, tokenId);
    }
}
