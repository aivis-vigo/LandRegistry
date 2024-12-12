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
        bool isRegistered;
    }

    mapping(uint256 => Property) public properties;
    uint256 public propertiesCount;

    constructor() {
        addProperty("Riga", "Centrs", "Dzirnavu iela", 290, 315000);
        addProperty("Riga", "Teika", "Ausmas iela", 530, 735000);
        addProperty("Riga", "Purvciems", "Dzelzavas iela", 750, 971500);
    }

    function addProperty(
        string memory city,
        string memory district,
        string memory street,
        uint256 squareMeters,
        uint256 price
    ) private {
        propertiesCount++;
        properties[propertiesCount] = Property(
            propertiesCount,
            city,
            district,
            street,
            squareMeters,
            price,
            msg.sender,
            true
        );
    }
}
