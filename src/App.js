import './App.scss';
import {useEffect, useState} from "react";
import Web3 from "web3";
import "./App.scss";

const abi = require('./truffle/build/contracts/LandRegistry.json').abi;
const contractAddress = require('./truffle/build/contracts/LandRegistry.json').networks['5777'].address;

function App() {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [propertyDetails, setPropertyDetails] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [property, setProperty] = useState({
        city: '',
        district: '',
        street: '',
        squareMeters: '',
        price: ''
    });
    const [propertiesCount, setPropertiesCount] = useState(0);

    const togglePopup = () => setIsPopupOpen(!isPopupOpen);

    useEffect(() => {
        const initializeWeb3 = async () => {
            try {
                const web3Instance = new Web3("http://127.0.0.1:7545");
                await window.ethereum.request({method: 'eth_requestAccounts'});
                setWeb3(web3Instance);
                const accounts = await web3Instance.eth.getAccounts();
                setAccount(accounts[0]);

                const landRegistryContract = new web3Instance.eth.Contract(abi, contractAddress);
                setContract(landRegistryContract);

                const count = await landRegistryContract.methods.propertiesCount().call();
                setPropertiesCount(count);
            } catch (error) {
                console.error('Error initializing Web3 or contract:', error);
            }
        };

        initializeWeb3();
    }, []);

    const createProperty = async (event) => {
        event.preventDefault()
        if (contract && web3) {
            try {
                const priceInWei = web3.utils.toWei(property.price, 'ether');

                await contract.methods.addProperty(
                    property.city,
                    property.district,
                    property.street,
                    property.squareMeters,
                    priceInWei
                )
                    .send({
                        from: account,
                        gas: 3000000
                    })

                const updatedCount = await contract.methods.propertiesCount().call();
                setPropertiesCount(updatedCount);

                setIsPopupOpen(prevState => !prevState);

                alert('Property added successfully!');
            } catch (error) {
                console.error('Error creating property:', error);
            }
        }
    };

    const getProperty = async (id) => {
        if (contract && web3) {
            try {
                const property = await contract.methods.properties(id).call();
                setPropertyDetails(property);
            } catch (error) {
                console.error('Error fetching property:', error);
            }
        }
    };

    return (
        <div className="custom-container">
            <h1>Land Registry</h1>

            <div className="tool-bar">
                <p>Account: {account}</p>
                <p>Available Properties: {propertiesCount}</p>
                <button onClick={togglePopup}>Add Property</button>
            </div>

            {isPopupOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-md">
                        <h2 className="text-lg font-bold mb-4">Add New Property</h2>
                        <form onSubmit={(e) => createProperty(e)}>
                            <label>City</label>
                            <input
                                value={property.city}
                                onChange={(e) => setProperty({...property, city: e.target.value})}
                                className="block mb-2 border p-2"
                            />
                            <label>District</label>
                            <input
                                value={property.district}
                                onChange={(e) => setProperty({...property, district: e.target.value})}
                                className="block mb-2 border p-2"
                            />
                            <label>Street</label>
                            <input
                                value={property.street}
                                onChange={(e) => setProperty({...property, street: e.target.value})}
                                className="block mb-2 border p-2"
                            />
                            <label>Square Meters</label>
                            <input
                                value={property.squareMeters}
                                onChange={(e) => setProperty({...property, squareMeters: e.target.value})}
                                className="block mb-2 border p-2"
                            />
                            <label>Price in ETH</label>
                            <input
                                value={property.price}
                                onChange={(e) => setProperty({...property, price: e.target.value})}
                                className="block mb-4 border p-2"
                            />
                            <button type="submit" className="bg-blue-500 text-white py-1 px-4 rounded">
                                Submit
                            </button>
                            <button type="button" onClick={togglePopup}
                                    className="bg-gray-500 text-white py-1 px-4 rounded ml-2">
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* list of available properties */}
            <div className="property-grid">
                {Array.from({length: Number(propertiesCount)}, (_, index) => (
                    <button key={index + 1} onClick={() => getProperty(index + 1)}>
                        Get Property {index + 1}
                    </button>
                ))}
            </div>

            {propertyDetails && (
                <div>
                    <h3>Property Details:</h3>
                    <p>City: {propertyDetails.city}</p>
                    <p>District: {propertyDetails.district}</p>
                    <p>Street: {propertyDetails.street}</p>
                    <p>Price: {web3.utils.fromWei(propertyDetails.price, 'ether')} ETH</p>
                    <p>Square Meters: {propertyDetails.squareMeters}</p>
                    <p>Current Owner: {propertyDetails.currentOwner}</p>
                    <p>Registered: {propertyDetails.isRegistered ? 'Yes' : 'No'}</p>
                </div>
            )}
        </div>
    );
}

export default App;
