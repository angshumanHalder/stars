// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotaryV2 is ERC721 {
    struct Star {
        string name;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starForSale;

    constructor() ERC721("Stars", "ST") {}

    function createStar(string memory _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name);
        tokenIdToStarInfo[_tokenId] = newStar;
        _mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You can't sale the star you don't own"
        );
        starForSale[_tokenId] = _price;
    }

    function _make_payable(address x) internal pure returns (address payable) {
        address payable payable_x = payable(x);
        return payable_x;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starForSale[_tokenId] > 0, "The star should be up for sale");
        uint256 starCost = starForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough ether");
        _transfer(ownerAddress, msg.sender, _tokenId);
        address payable ownerAddressPayable = _make_payable(ownerAddress);
        ownerAddressPayable.transfer(starCost);
        if (msg.value > starCost) {
            address payable buyerAddressPayable = _make_payable(msg.sender);
            buyerAddressPayable.transfer(msg.value - starCost);
        }
        starForSale[_tokenId] = 0;
    }

    function lookUptokenIdToStarInfo(uint256 _tokenId)
        public
        view
        returns (string memory)
    {
        //1. You should return the Star saved in tokenIdToStarInfo mapping
        return tokenIdToStarInfo[_tokenId].name;
    }

    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        require(
            ownerOf(_tokenId1) == msg.sender ||
                ownerOf(_tokenId2) == msg.sender,
            "You are not the owner of either of the stars"
        );
        address owner1 = ownerOf(_tokenId1);
        address owner2 = ownerOf(_tokenId2);
        _transfer(owner1, owner2, _tokenId1);
        _transfer(owner2, owner1, _tokenId2);
    }

    function transferStar(address _to1, uint256 _tokenId) public {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You are not the owner of the star"
        );
        _transfer(msg.sender, _to1, _tokenId);
    }
}
