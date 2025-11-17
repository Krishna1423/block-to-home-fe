// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PropertyToken
 * @dev ERC-721 token representing real estate properties
 * Each token represents a unique property that has been tokenized
 */
contract PropertyToken is ERC721URIStorage, Ownable {
    // Token ID counter
    uint256 private _tokenIdCounter;

    // Property data structure
    struct PropertyData {
        uint256 tokenId;
        address owner;
        uint256 valuation; // Property value in USDT (6 decimals)
        uint256 tokenizedPortion; // Percentage tokenized (0-100)
        uint256 tokenizedValue; // Actual tokenized value in USDT
        string collateralType; // "USDT" or "Gold"
        string metadataURI; // IPFS hash or URI for property metadata
        uint256 createdAt;
        bool isActive; // Whether the property is active
    }

    // Mapping from token ID to property data
    mapping(uint256 => PropertyData) public properties;

    // Mapping from owner address to array of token IDs
    mapping(address => uint256[]) public ownerProperties;

    // Events
    event PropertyTokenized(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 valuation,
        uint256 tokenizedValue,
        string collateralType,
        string metadataURI
    );

    event PropertyUpdated(
        uint256 indexed tokenId,
        string metadataURI
    );

    event PropertyTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to
    );

    constructor(address initialOwner) ERC721("BlockToHome Property", "BTHP") Ownable(initialOwner) {
        // Start token IDs at 1
        _tokenIdCounter = 1;
    }

    /**
     * @dev Mint a new property token
     * @param to The address that will own the token
     * @param valuation Property valuation in USDT (6 decimals)
     * @param tokenizedPortion Percentage of property tokenized (0-100)
     * @param tokenizedValue Actual tokenized value in USDT
     * @param collateralType Type of collateral ("USDT" or "Gold")
     * @param tokenURI IPFS hash or URI for property metadata
     * @return tokenId The ID of the newly minted token
     * @notice Users can mint tokens to themselves (to must be msg.sender or owner can mint to anyone)
     */
    function mintPropertyToken(
        address to,
        uint256 valuation,
        uint256 tokenizedPortion,
        uint256 tokenizedValue,
        string memory collateralType,
        string memory tokenURI
    ) public returns (uint256) {
        // Allow users to mint to themselves, or owner to mint to anyone
        require(
            msg.sender == to || msg.sender == owner(),
            "PropertyToken: can only mint to yourself or owner can mint to anyone"
        );
        require(to != address(0), "PropertyToken: cannot mint to zero address");
        require(valuation > 0, "PropertyToken: valuation must be greater than 0");
        require(tokenizedPortion > 0 && tokenizedPortion <= 100, "PropertyToken: tokenized portion must be between 1 and 100");
        require(tokenizedValue > 0, "PropertyToken: tokenized value must be greater than 0");
        require(bytes(collateralType).length > 0, "PropertyToken: collateral type is required");
        require(bytes(tokenURI).length > 0, "PropertyToken: token URI is required");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Mint the token
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // Store property data
        properties[tokenId] = PropertyData({
            tokenId: tokenId,
            owner: to,
            valuation: valuation,
            tokenizedPortion: tokenizedPortion,
            tokenizedValue: tokenizedValue,
            collateralType: collateralType,
            metadataURI: tokenURI,
            createdAt: block.timestamp,
            isActive: true
        });

        // Add to owner's properties list
        ownerProperties[to].push(tokenId);

        // Emit event
        emit PropertyTokenized(
            tokenId,
            to,
            valuation,
            tokenizedValue,
            collateralType,
            tokenURI
        );

        return tokenId;
    }

    /**
     * @dev Update property metadata URI
     * @param tokenId The token ID
     * @param newTokenURI New IPFS hash or URI
     */
    function updatePropertyMetadata(uint256 tokenId, string memory newTokenURI) public {
        require(_ownerOf(tokenId) == msg.sender || owner() == msg.sender, "PropertyToken: not authorized");
        require(bytes(newTokenURI).length > 0, "PropertyToken: token URI is required");

        _setTokenURI(tokenId, newTokenURI);
        properties[tokenId].metadataURI = newTokenURI;

        emit PropertyUpdated(tokenId, newTokenURI);
    }

    /**
     * @dev Get property data
     * @param tokenId The token ID
     * @return PropertyData struct containing all property information
     */
    function getPropertyData(uint256 tokenId) public view returns (PropertyData memory) {
        require(_ownerOf(tokenId) != address(0), "PropertyToken: token does not exist");
        return properties[tokenId];
    }

    /**
     * @dev Get all token IDs owned by an address
     * @param owner The address to query
     * @return Array of token IDs
     */
    function getOwnerProperties(address owner) public view returns (uint256[] memory) {
        return ownerProperties[owner];
    }

    /**
     * @dev Get total number of tokens minted
     * @return Total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter - 1; // Subtract 1 because counter starts at 1
    }

    /**
     * @dev Check if a property is active
     * @param tokenId The token ID
     * @return True if property is active
     */
    function isPropertyActive(uint256 tokenId) public view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "PropertyToken: token does not exist");
        return properties[tokenId].isActive;
    }

    /**
     * @dev Deactivate a property (e.g., for liquidation)
     * @param tokenId The token ID
     */
    function deactivateProperty(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "PropertyToken: token does not exist");
        properties[tokenId].isActive = false;
    }

    /**
     * @dev Reactivate a property
     * @param tokenId The token ID
     */
    function reactivateProperty(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "PropertyToken: token does not exist");
        properties[tokenId].isActive = true;
    }

    /**
     * @dev Override transfer functions to update owner properties list
     * Also prevents transfers if property is not active (except for minting)
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Prevent transfers if property is not active (allow minting)
        if (from != address(0)) {
            require(properties[tokenId].isActive, "PropertyToken: property is not active");
        }
        
        // Call parent update
        address previousOwner = super._update(to, tokenId, auth);

        // Update property data
        if (from != address(0) && to != address(0)) {
            properties[tokenId].owner = to;

            // Remove from old owner's list
            uint256[] storage fromProperties = ownerProperties[from];
            for (uint256 i = 0; i < fromProperties.length; i++) {
                if (fromProperties[i] == tokenId) {
                    fromProperties[i] = fromProperties[fromProperties.length - 1];
                    fromProperties.pop();
                    break;
                }
            }

            // Add to new owner's list
            ownerProperties[to].push(tokenId);

            emit PropertyTransferred(tokenId, from, to);
        }

        return previousOwner;
    }
}

