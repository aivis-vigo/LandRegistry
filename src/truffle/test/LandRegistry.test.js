const LandRegistryTest = artifacts.require("LandRegistry");
const truffleAssert = require('truffle-assertions');

contract("LandRegistry", (accounts) => {
    let landRegistry;
    const [owner, addr1, addr2, addr3] = accounts;

    beforeEach(async () => {
        landRegistry = await LandRegistryTest.new();
    });

    describe("addProperty", () => {
        it("should allow adding a new property", async () => {
            await landRegistry.addProperty("CityA", "DistrictA", "StreetA", 100, 1000, { from: owner });
            const property = await landRegistry.properties(1);

            assert.equal(property.city, "CityA");
            assert.equal(property.district, "DistrictA");
            assert.equal(property.street, "StreetA");
            assert.equal(property.squareMeters.toNumber(), 100);
            assert.equal(property.price.toNumber(), 1000);
            assert.equal(property.currentOwner, owner);
        });

        it("should prevent adding a property with an existing street", async () => {
            await landRegistry.addProperty("CityA", "DistrictA", "StreetA", 100, 1000, { from: owner });
            await truffleAssert.reverts(
                landRegistry.addProperty("CityB", "DistrictB", "StreetA", 120, 1200, { from: owner }),
                "This property already exists"
            );
        });
    });

    describe("transferOwnership", () => {
        it("should transfer ownership correctly", async () => {
            await landRegistry.addProperty("CityA", "DistrictA", "StreetA", 100, 1000, { from: owner });
            await landRegistry.transferOwnership(1, owner, addr1, { from: owner });

            const property = await landRegistry.properties(1);
            assert.equal(property.currentOwner, addr1);
        });

        it("should prevent transferring ownership by non-owner", async () => {
            await landRegistry.addProperty("CityA", "DistrictA", "StreetA", 100, 1000, { from: owner });
            await truffleAssert.reverts(
                landRegistry.transferOwnership(1, addr2, addr3, { from: addr2 }),
                "Only current owner can make the transfer"
            );
        });

        it("should prevent transferring ownership to address(0)", async () => {
            await landRegistry.addProperty("CityA", "DistrictA", "StreetA", 100, 1000, { from: owner });
            await truffleAssert.reverts(
                landRegistry.transferOwnership(1, owner, "0x0000000000000000000000000000000000000000", { from: owner }),
                "Invalid new owners address"
            );
        });

        it("should prevent transferring ownership to the same owner", async () => {
            await landRegistry.addProperty("CityA", "DistrictA", "StreetA", 100, 1000, { from: owner });
            await truffleAssert.reverts(
                landRegistry.transferOwnership(1, owner, owner, { from: owner }),
                "New owner can't be the current owner"
            );
        });
    });

    describe("buyProperty", () => {
        it("should allow buying a property", async () => {
            await landRegistry.addProperty("CityA", "DistrictA", "StreetA", 100, 1000, { from: owner });
            await landRegistry.buyProperty(1, { from: addr2, value: 1000 });

            const property = await landRegistry.properties(1);
            assert.equal(property.currentOwner, addr2);
        });

        it("should revert if not enough ether is sent", async () => {
            await landRegistry.addProperty("CityA", "DistrictA", "StreetA", 100, 1000, { from: owner });
            await truffleAssert.reverts(
                landRegistry.buyProperty(1, { from: addr2, value: 500 }),
                "Insufficient funds sent"
            );
        });

        it("should revert if the property is inactive", async () => {
            await landRegistry.addProperty("CityA", "DistrictA", "StreetA", 100, 1000, { from: owner });
            await landRegistry.transferOwnership(1, owner, addr1, { from: owner });
            await landRegistry.changeListingStatus(1, { from: addr1 });

            await truffleAssert.reverts(
                landRegistry.buyProperty(1, { from: addr2, value: 1000 }),
                "Can't buy inactive listing"
            );
        });

        it("should revert if the property is not registered", async () => {
            await truffleAssert.reverts(
                landRegistry.buyProperty(999, { from: addr2, value: 1000 }),
                "Property you are trying to buy is not registered"
            );
        });
    });

    describe("changeListingStatus", () => {
        it("should allow the owner to change the listing status", async () => {
            await landRegistry.addProperty("CityA", "DistrictA", "StreetA", 100, 1000, { from: owner });
            await landRegistry.changeListingStatus(1, { from: owner });

            const property = await landRegistry.properties(1);
            assert.isFalse(property.activeListing);
        });

        it("should revert if the caller is not the owner", async () => {
            await landRegistry.addProperty("CityA", "DistrictA", "StreetA", 100, 1000, { from: owner });
            await truffleAssert.reverts(
                landRegistry.changeListingStatus(1, { from: addr1 }),
                "Listing doesn't belong to this account"
            );
        });
    });
});
