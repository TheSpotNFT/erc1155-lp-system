import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AVAX_CONTRACTS, ETH_CONTRACTS } from '../utils/contractLists';
import Navbar from '../components/Navbar';

const Home = () => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [pools, setPools] = useState([]);
  const [filteredPools, setFilteredPools] = useState([]);
  const [newPoolTokenId, setNewPoolTokenId] = useState('');
  const [availableContracts, setAvailableContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState('');
  const [listingFee, setListingFee] = useState('');
  const [network, setNetwork] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (provider) {
      detectNetwork();
    }
  }, [provider, account]);

  useEffect(() => {
    fetchDummyPools();
  }, []);

  useEffect(() => {
    filterPools();
  }, [pools, network, searchTerm]);

  const detectNetwork = async () => {
    if (!provider) {
      console.error("Provider is not set");
      return;
    }
    const network = await provider.getNetwork();
    if (network.chainId === 43114) { // Avalanche Mainnet Chain ID
      setAvailableContracts(AVAX_CONTRACTS);
      setListingFee(ethers.utils.parseEther("0.1"));
      setNetwork('Avax');
    } else if (network.chainId === 1) { // Ethereum Mainnet Chain ID
      setAvailableContracts(ETH_CONTRACTS);
      setListingFee(ethers.utils.parseEther("0.001"));
      setNetwork('Eth');
    }
  };

  const fetchDummyPools = async () => {
    try {
      const response = await fetch('/dummyPools.json');
      const data = await response.json();
      setPools(data);
    } catch (error) {
      console.error('Error fetching dummy pools:', error);
    }
  };

  const createPool = async () => {
    if (!contract) return;
    try {
      const selectedContractData = availableContracts.find(c => c.name === selectedContract);
      const tx = await contract.createPool(selectedContractData.address, newPoolTokenId, { value: listingFee });
      await tx.wait();
      fetchDummyPools();
    } catch (error) {
      console.error('Error creating pool:', error);
    }
  };

  const addLiquidity = async (poolId, amount) => {
    if (!contract) return;
    try {
      const tx = await contract.addLiquidity(poolId, amount);
      await tx.wait();
      fetchDummyPools();
    } catch (error) {
      console.error('Error adding liquidity:', error);
    }
  };

  const claimRewards = async (poolId) => {
    if (!contract) return;
    try {
      const tx = await contract.claimRewards(poolId);
      await tx.wait();
      fetchDummyPools();
    } catch (error) {
      console.error('Error claiming rewards:', error);
    }
  };

  const buyTokens = async (poolId, amount) => {
    // Implement buy token logic here
  };

  const sellTokens = async (poolId, amount) => {
    // Implement sell token logic here
  };

  const handleConnect = (provider, account) => {
    setProvider(provider);
    setAccount(account);
    detectNetwork();
  };

  const handleNetworkChange = (newNetwork) => {
    setNetwork(newNetwork);
    fetchDummyPools();
  };

  const filterPools = () => {
    const filtered = pools.filter(
      pool => pool.chain.toLowerCase() === network.toLowerCase() && pool.tokenId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPools(filtered);
  };

  return (
    <div className="container mx-auto p-4 bg-zinc-800 text-white bg-opacity-0 relative z-10">
      <Navbar onConnect={handleConnect} onNetworkChange={handleNetworkChange} />

      <main className="max-w-6xl mx-auto">
        <h1 className="text-6xl font-bold mb-4 mx-auto flex pt-16 md:pt-32">Cowrie Network</h1>
        <h1 className="text-4xl font-bold mb-4 mx-auto flex pb-16">Bringing Liquidity to ERC-1155 Tokens</h1>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Create New Liquidity Pool (Contract must be Approved for Listings)</h2>
          <h2 className="text-xl font-semibold mb-2">Currently Limited to Pairing with Native Token</h2>
          <select
            value={selectedContract}
            onChange={(e) => setSelectedContract(e.target.value)}
            className="w-full mb-2 p-2 border border-zinc-600 rounded bg-zinc-700 text-white"
          >
            <option value="">Select Contract</option>
            {availableContracts.map((contract) => (
              <option key={contract.address} value={contract.name}>
                {contract.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Token ID"
            value={newPoolTokenId}
            onChange={(e) => setNewPoolTokenId(e.target.value)}
            className="w-full mb-2 p-2 border border-zinc-600 bg-zinc-700 text-white rounded"
          />
          <button onClick={createPool} className="w-full p-2 bg-green-500 hover:bg-green-700 text-gray-100 font-bold rounded duration-150">
            Create Pool
          </button>
          <p className="mt-2">Listing Fee: {network === 'Avax' ? '0.1 AVAX' : '0.001 ETH'}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 pt-16">Available Liquidity Pools</h2>
          <input
            type="text"
            placeholder="Search by Token ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-4 p-2 border border-zinc-700 bg-zinc-700 text-white rounded"
          />
          <div className="grid grid-cols-8 gap-4 p-4 bg-zinc-700">
            <div className="flex font-semibold h-12 w-12"></div>
            <div className="font-semibold">Token ID</div>
            <div className="font-semibold">Total Liquidity</div>
            <div className="font-semibold">Reward Rate</div>
            <div className="font-semibold">Your LP Tokens</div>
            <div className="font-semibold">Current Rewards</div>
            <div className="font-semibold text-center col-span-2">Actions</div>
          </div>
          <ul className="space-y-4">
            {filteredPools.map((pool) => (
              <li key={pool.id} className="flex items-center p-4 border-b border-zinc-500 pt-8">
                <div className='flex mx-auto'><img src={pool.imageUrl} alt={`Token ${pool.tokenId}`} className="w-24 h-24 p" /></div>
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <p className='mx-auto'>{pool.tokenId}</p>
                  <p className='mx-auto'>${pool.totalLiquidity}</p>
                  <p className='mx-auto'>{pool.rewardRate}</p>
                  <p className='mx-auto'>{pool.yourLockedLP}</p>
                  <p className='mx-auto'>{pool.rewards}</p>
                </div>
                <div className="flex flex-col space-y-2 w-48 pb-4 pr-4">
                  <input type="text" placeholder="Amount" className="h-11 placeholder:pl-4 border border-zinc-600 bg-zinc-700 text-white rounded" />
                  <button onClick={() => buyTokens(pool.id, 100 /* example amount */)} className="h-11 p-2 bg-green-400 hover:bg-green-500 duration-150 text-gray-100 font-bold rounded">
                    Buy
                  </button>
                  <button onClick={() => sellTokens(pool.id, 100 /* example amount */)} className="h-11 p-2 bg-green-500 hover:bg-green-600 duration-150 text-gray-100 font-bold rounded">
                    Sell
                  </button>
      
                </div>
                <div className="flex flex-col space-y-2 w-48 pb-4 pl-4">
                <button onClick={() => addLiquidity(pool.id, 100 /* example amount */)} className="h-11 p-2 bg-green-600 hover:bg-green-700 duration-150 text-gray-100 font-bold rounded">
                    Provide LP
                  </button>
                  <button onClick={() => claimRewards(pool.id)} className="h-11 p-2 bg-green-700 hover:bg-green-800 duration-150 text-gray-100 font-bold rounded">
                    Claim LP Rewards
                  </button>
                  <button onClick={() => claimRewards(pool.id)} className="h-11 p-2 bg-green-800 hover:bg-green-900 duration-150 text-gray-100 font-bold rounded">
                    Chart
                  </button></div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Home;
