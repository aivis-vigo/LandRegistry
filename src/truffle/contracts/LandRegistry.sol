// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LandRegistry {

    struct Property {
        uint256 id;
        string city;
        string district;
        string street;
        uint256 squareMeters;
        uint256 price;
        address currentOwner;
        bool activeListing;
        bool isRegistered;
    }

    mapping(uint256 => Property) public properties;
    uint256 public propertiesCount;

    event OwnershipTransferred(
        uint256 indexed propertyId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    function addProperty(
        string memory city,
        string memory district,
        string memory street,
        uint256 squareMeters,
        uint256 price
    ) public {
        propertiesCount++;

        properties[propertiesCount] = Property(
            propertiesCount,
            city,
            district,
            street,
            squareMeters,
            price,
            msg.sender,
            true,
            true
        );
    }

    function transferOwnership(
        uint256 propertyId,
        address currentOwner,
        address newOwner
    ) public {
        require(properties[propertyId].isRegistered, "Property is not registered");
        require(properties[propertyId].currentOwner == currentOwner, "Only current owner can make the transfer");
        require(newOwner != address(0), "Invalid new owners address");
        require(newOwner != currentOwner, "New owner can't be the current owner");

        properties[propertyId].currentOwner = newOwner;

        emit OwnershipTransferred(
            propertyId,
            currentOwner,
            newOwner,
            block.timestamp
        );
    }

    /* todo: funds are released if the transaction fails for some reason */
    /* todo: event to track when transaction took place */
    function buyProperty(
        uint256 propertyId
    ) public payable {
        Property storage property = properties[propertyId];

        require(property.isRegistered, "Property you are trying to buy is not registered");
        require(property.activeListing == true, "Can't buy inactive listing");
        require(propertyId == property.id, "Property ID's not matching");
        require(msg.value >= property.price, "Insufficient funds sent");

        payable(property.currentOwner).transfer(msg.value);

        transferOwnership(propertyId, property.currentOwner, msg.sender);
    }

    /* todo: event with timestamp to track the time when changes took place */
    function changeListingStatus(
        uint256 propertyId
    ) public {
        Property storage property = properties[propertyId];

        require(propertyId == property.id, "Property ID's not matching");
        require(msg.sender == property.currentOwner, "Listing doesn't belong to this account");

        property.activeListing = !property.activeListing;
    }

}
