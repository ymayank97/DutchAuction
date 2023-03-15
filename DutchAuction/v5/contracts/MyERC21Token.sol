// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract MyERC21Token is ERC721, Ownable {


    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint public currSupply;
    uint public maxSupply;


    constructor(uint maxSup) ERC721("My ERC21 Token", "MERC21") {
        maxSupply = maxSup;
    }

    function mint(address to) payable public onlyOwner{

        require(maxSupply > currSupply,"already minted max");

        _tokenIds.increment();

        _mint(to,_tokenIds.current());
        currSupply++;
    }

    function getTokenIds() public view returns (uint256) {
    return _tokenIds.current();
}
}
