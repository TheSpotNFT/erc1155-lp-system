import React, { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { getProviderOptions } from '../utils/web3modalConfig';

const Navbar = ({ onConnect }) => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState('');

  useEffect(() => {
    if (provider) {
      detectNetwork();
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      return () => {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [provider]);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      onConnect(provider, accounts[0]);
      if (provider) {
        await detectNetwork();
      }
    }
  };

  const handleChainChanged = async () => {
    if (provider) {
      await detectNetwork();
    }
  };

  const detectNetwork = async () => {
    if (!provider) return;
    const network = await provider.getNetwork();
    const networkName = network.chainId === 43114 ? 'Avalanche' : 'Ethereum';
    console.log(`Detected network: ${networkName}`); // Debugging statement
    setNetwork(networkName);
  };

  const connectWallet = async () => {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions: getProviderOptions(),
    });
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    const accounts = await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setProvider(provider);
    setAccount(address);
    onConnect(provider, address);
    await detectNetwork();
  };

  const switchNetwork = async () => {
    if (!provider) return;

    const targetNetwork = network === 'Avalanche' ? 'Ethereum' : 'Avalanche';
    const chainId = targetNetwork === 'Avalanche' ? '0xa86a' : '0x1'; // Switch to the opposite network
    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId }]);
      console.log(`Switched to network: ${targetNetwork}`); // Debugging statement
      setNetwork(targetNetwork);
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await provider.send('wallet_addEthereumChain', [
            {
              chainId,
              chainName: targetNetwork === 'Avalanche' ? 'Avalanche Network' : 'Ethereum Mainnet',
              rpcUrls: targetNetwork === 'Avalanche'
                ? ['https://api.avax.network/ext/bc/C/rpc']
                : ['https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'],
              nativeCurrency: targetNetwork === 'Avalanche'
                ? { name: 'Avalanche', symbol: 'AVAX', decimals: 18 }
                : { name: 'Ether', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: targetNetwork === 'Avalanche' ? ['https://cchain.explorer.avax.network/'] : ['https://etherscan.io'],
            },
          ]);
          console.log(`Added and switched to network: ${targetNetwork}`); // Debugging statement
          setNetwork(targetNetwork);
        } catch (addError) {
          console.error(addError);
        }
      }
    }
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-zinc-800 text-white">
      <button onClick={connectWallet} className="bg-green-500 hover:bg-green-800 duration-150 text-white font-bold py-2 px-4 rounded">
        {account ? `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect Wallet'}
      </button>
      {account && (
        <button onClick={switchNetwork} className="bg-green-500 hover:bg-green-700 duration-150 text-white font-bold py-2 px-4 rounded">
          Switch to {network === 'Avalanche' ? 'Ethereum' : 'Avalanche'}
        </button>
      )}
    </nav>
  );
};

export default Navbar;
