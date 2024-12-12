import './App.css';
import { useEffect, useState } from "react";
import Web3 from "web3";

const abi = require('./truffle/build/contracts/LandRegistry.json').abi;
const contractAddress = require('./truffle/build/contracts/LandRegistry.json').networks['5777'].address;

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [propertyDetails, setPropertyDetails] = useState(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        const web3Instance = new Web3("http://127.0.0.1:7545");
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);

        const landRegistryContract = new web3Instance.eth.Contract(abi, contractAddress);
        setContract(landRegistryContract);
      } catch (error) {
        console.error('Error initializing Web3 or contract:', error);
      }
    };

    initializeWeb3();
  }, []);

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
      <div className="App">
        <h1>Land Registry</h1>
        <p>Account: {account}</p>

        <button onClick={() => getProperty(1)}>Get Property 1</button>
        <button onClick={() => getProperty(2)}>Get Property 2</button>
        <button onClick={() => getProperty(3)}>Get Property 3</button>

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
