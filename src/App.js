import './App.scss';
import {useEffect, useState} from "react";
import Web3 from "web3";
import "./App.scss";

const abi = require('./truffle/build/contracts/LandRegistry.json').abi;
const contractAddress = require('./truffle/build/contracts/LandRegistry.json').networks['5777'].address;

function App() {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState('');
    const [accounts, setAccounts] = useState([]);
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

    const changeAccount = (e) => {
        e.preventDefault();
        setAccount(e.target.value);
    };

    useEffect(() => {
        const initializeWeb3 = async () => {
            try {
                const web3Instance = new Web3("http://127.0.0.1:7545");
                await window.ethereum.request({method: 'eth_requestAccounts'});
                setWeb3(web3Instance);
                const accounts = await web3Instance.eth.getAccounts();
                setAccounts(accounts);
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

                setProperty({
                    city: '',
                    district: '',
                    street: '',
                    squareMeters: '',
                    price: ''
                });

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

    /* todo: how is the notary service going to be notified when transaction has taken place */
    /* todo: ability to adjust price how much to send? */
    const buyProperty = async (id) => {
        if (contract && web3) {
            try {
                const property = await contract.methods.properties(id).call();

                const propertyPriceInEther = web3.utils.fromWei(property.price, 'ether');
                let totalPriceInEther = Number(propertyPriceInEther) + 0.05;
                const priceInWei = web3.utils.toWei(totalPriceInEther.toString(), 'ether');

                const gasEstimate = await contract.methods.buyProperty(id).estimateGas({
                    from: account,
                    value: priceInWei
                });

                await contract.methods.buyProperty(id).send({
                    from: account,
                    value: priceInWei,
                    gas: gasEstimate,
                });

                await getProperty(id);
            } catch (error) {
                console.error('Error buying property:', error);
            }
        }
    };

    const changeListingStatus = async (id) => {
        if (contract && web3) {
            try {
                const gasEstimate = await contract.methods.changeListingStatus(id).estimateGas({
                    from: account
                });

                await contract.methods.changeListingStatus(id).send({
                    from: account,
                    gas: gasEstimate
                });

                await getProperty(id);
            } catch (error) {
                console.error('Error toggling properties status:', error);
            }
        }
    };

    return (
        <div className="custom-container">
            <h1>Real Estate Properties</h1>

            <div className="flex flex-row justify-between pb-4 border-b border-black">
                <div className="flex flex-col">
                    <p>Account:</p>
                    <select value={account} onChange={(e) => changeAccount(e)} className="border rounded-lg p-2">
                        {accounts.map((account, index) => (
                            <option key={index} value={account}>
                                {account}
                            </option>
                        ))}
                    </select>
                </div>
                <p>Registered Properties: {propertiesCount}</p>
                <button onClick={togglePopup}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M21 14V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H10V5H5V19H19V14H21Z"
                            fill="black"/>
                        <path d="M21 7H17V3H15V7H11V9H15V13H17V9H21V7Z" fill="black"/>
                    </svg>
                </button>
            </div>

            {/* form for creating listings */}
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

            {/* todo: should listing still be visible even if the listing is not active */}
            {/* todo: show more useful info for this card */}
            {/* list of available properties */}
            <div className="property-grid">
                {Array.from({length: Number(propertiesCount)}, (_, index) => (
                    <div key={index + 1} onClick={() => getProperty(index + 1)}
                         className="text-center p-4 bg-orange-400 rounded-lg">
                        Get Property {index + 1}
                    </div>
                ))}
            </div>

            {/* todo: indicate that it's active */}
            {propertyDetails && (
                <div>
                    <h2>Property Details:</h2>
                    <p>City: {propertyDetails.city}</p>
                    <p>District: {propertyDetails.district}</p>
                    <p>Street: {propertyDetails.street}</p>
                    <p>Price: {web3.utils.fromWei(propertyDetails.price, 'ether')} ETH</p>
                    <p>Square Meters: {propertyDetails.squareMeters}</p>
                    <p>Current Owner: {propertyDetails.currentOwner}</p>
                    <p>Registered: {propertyDetails.isRegistered ? 'Yes' : 'No'}</p>
                    {/* users who are not owners can only try to buy this property */}
                    {propertyDetails.currentOwner !== account && (
                        <button onClick={() => buyProperty(propertyDetails.id)} className="bg-green-400 p-2">
                            Buy
                        </button>
                    )}
                    {/* only owner can show/hide the listing  */}
                    {propertyDetails.currentOwner === account && (
                        <button onClick={() => changeListingStatus(propertyDetails.id)} className="bg-orange-400 p-2">
                            {propertyDetails.activeListing ? "Deactivate" : "Activate"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
