import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Particles from 'react-tsparticles';
import "./App.css";

const contractABI = [
  {
    "inputs": [],
    "name": "message",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "newMessage",
        "type": "string"
      }
    ],
    "name": "setMessage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; 

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [message, setMessage] = useState('');
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      fetchAccounts(provider);
    } else {
      alert('MetaMask is not installed');
    }
  }, []);

  const fetchAccounts = async (provider) => {
    try {
      const accounts = await provider.listAccounts();
      setAccounts(accounts); 
      if (accounts.length > 0) {
        setAccount(accounts[0]);  
      }
    } catch (err) {
      console.error('Error fetching accounts', err);
      alert('Error fetching accounts');
    }
  };

  useEffect(() => {
    if (provider && account) {
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contractInstance);

      fetchMessage(contractInstance);
    }
  }, [provider, account]);

  const connectWallet = async () => {
    try {
      console.log('Requesting accounts...');
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const accounts = await provider.listAccounts();
      console.log('Accounts fetched:', accounts);
      setAccounts(accounts);

      if (accounts.length > 0) {
        setAccount(accounts[0]); 
      } else {
        alert('No accounts found');
      }
    } catch (err) {
      console.error('Error connecting to MetaMask', err);
      alert('Error connecting to MetaMask');
    }
  };

  const fetchMessage = async (contractInstance) => {
    try {
      const messageFromContract = await contractInstance.message();
      setMessage(messageFromContract);
    } catch (err) {
      console.error('Error fetching message', err);
      alert('Error fetching message');
    }
  };

  const updateMessage = async (newMessage) => {
    if (!contract) {
      alert("Contract is not initialized");
      return;
    }
    try {
      const tx = await contract.setMessage(newMessage);
      await tx.wait();
      console.log('Transaction successful!');
      fetchMessage(contract);
    } catch (err) {
      console.error('Error updating message', err);
      alert('Error updating message');
    }
  };

  return (
    <div className="App" style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      <Particles 
        options={{
          background: {
            color: {
              value: "#111111",
            },
          },
          particles: {
            number: {
              value: 50,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: 3,
            },
            move: {
              enable: true,
              speed: 1,
            },
          },
        }}
      />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#fff", textAlign: "center", zIndex: 10 }}>
        <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>My DApp with React</h1>
        
        {!account ? (
          <button onClick={connectWallet} className="fancy-btn">Connect Wallet</button>
        ) : (
          <div>
            <p style={{ fontSize: "20px", marginBottom: "10px" }}>Connected Account: {account}</p>
            <p style={{ fontSize: "20px", marginBottom: "20px" }}>Current Message from Contract: {message}</p>
            <button 
              onClick={() => updateMessage("Hello, Ethereum!")} 
              className="fancy-btn"
            >
              Set Message to "Hello, Ethereum Bro!"
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
