import './App.scss';
import {useEffect, useState} from "react";
import Web3 from "web3";
import "./App.scss";
import PropertiesMap from "./GoogleMap";
import PropertyDetails from "./PropertyDetails";
import CreatePropertyForm from "./CreatePropertyForm";
import ToolBar from "./ToolBar";

const App = () => {
    const abi = require('./truffle/build/contracts/LandRegistry.json').abi;
    const contractAddress = require('./truffle/build/contracts/LandRegistry.json').networks['5777'].address;
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [contract, setContract] = useState(null);
    const [propertyDetails, setPropertyDetails] = useState(null);
    const [isCreatePropertyPopupOpen, setIsCreatePropertyPopupOpen] = useState(false);
    const [isDetailsPopupOpen, setDetailsPopupOpen] = useState(false);
    const [property, setProperty] = useState({
        city: '',
        district: '',
        street: '',
        squareMeters: '',
        price: ''
    });
    const [propertiesCount, setPropertiesCount] = useState(0);
    const [markers, setMarkers] = useState([]);

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
                setPropertiesCount(Number(count));
            } catch (error) {
                console.error('Error initializing Web3 or contract:', error);
            }
        };

        initializeWeb3();
    }, []);

    const toggleCreatePopup = () => setIsCreatePropertyPopupOpen(!isCreatePropertyPopupOpen);

    const toggleDetailsPopup = () => setDetailsPopupOpen(!isDetailsPopupOpen);

    const changeAccount = (e) => {
        e.preventDefault();
        setAccount(e.target.value);
    };

    const createProperty = async (event) => {
        event.preventDefault();

        geocodeAddress(`${property.city}, ${property.district}, ${property.street}`)
            .then(coords => {
                if (coords) {
                    setMarkers(prevMarkers => [...prevMarkers, {lat: coords.lat, lng: coords.lng}]);
                }
            });

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
                setPropertiesCount(Number(updatedCount));

                setProperty({
                    city: '',
                    district: '',
                    street: '',
                    squareMeters: '',
                    price: ''
                });

                setIsCreatePropertyPopupOpen(prevState => !prevState);

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
                setDetailsPopupOpen(prevState => !prevState);
            } catch (error) {
                console.error('Error fetching property:', error);
            }
        }
    };

    const geocodeAddress = async (address) => {
        const apiKey = process.env.REACT_APP_GEOCODING_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK') {
                const {lat, lng} = data.results[0].geometry.location;
                return {lat, lng};
            } else {
                console.error(`Geocoding error: ${data.status}`);
                return null;
            }
        } catch (error) {
            console.error('Error fetching geocode data:', error);
            return null;
        }
    };

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
            <h1>Real Estate</h1>

            <ToolBar
                account={account}
                allAccounts={accounts}
                propertiesCount={propertiesCount}
                changeAccount={changeAccount}
                togglePopup={toggleCreatePopup}>
            </ToolBar>

            {isCreatePropertyPopupOpen && (
                <CreatePropertyForm
                    property={property}
                    createProperty={createProperty}
                    setProperty={setProperty}
                    togglePopup={toggleCreatePopup}>
                </CreatePropertyForm>
            )}

            {(propertyDetails && isDetailsPopupOpen) && (
                <PropertyDetails
                    web3={web3}
                    details={propertyDetails}
                    account={account}
                    buyProperty={buyProperty}
                    changeListingStatus={changeListingStatus}
                    togglePopup={toggleDetailsPopup}>
                </PropertyDetails>
            )}

            <PropertiesMap markers={markers} onMarkerClick={getProperty}></PropertiesMap>
        </div>
    );
}

export default App;
