import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AVAX_CONTRACTS, ETH_CONTRACTS } from '../utils/contractLists';
import Navbar from '../components/Navbar';

const Home = () => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [pools, setPools] = useState([]);
  const [newPoolTokenId, setNewPoolTokenId] = useState('');
  const [availableContracts, setAvailableContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState('');
  const [listingFee, setListingFee] = useState('');
  const [network, setNetwork] = useState('');

  useEffect(() => {
    if (provider) {
      detectNetwork();
    }
  }, [provider, account]);

  useEffect(() => {
    // Fetch the dummy data when the component mounts
    fetch('/dummyPools.json')
      .then((response) => response.json())
      .then((data) => setPools(data))
      .catch((error) => console.error('Error fetching dummy pools:', error));
  }, []);

  const detectNetwork = async () => {
    const network = await provider.getNetwork();
    if (network.chainId === 43114) { // Avalanche Mainnet Chain ID
      setAvailableContracts(AVAX_CONTRACTS);
      setListingFee(ethers.utils.parseEther("0.1"));
      setNetwork('Avalanche');
    } else if (network.chainId === 1) { // Ethereum Mainnet Chain ID
      setAvailableContracts(ETH_CONTRACTS);
      setListingFee(ethers.utils.parseEther("0.001"));
      setNetwork('Ethereum');
    }
  };

  const createPool = async () => {
    if (!contract) return;
    try {
      const selectedContractData = availableContracts.find(c => c.name === selectedContract);
      const tx = await contract.createPool(selectedContractData.address, newPoolTokenId, { value: listingFee });
      await tx.wait();
      fetchPools(contract);
    } catch (error) {
      console.error('Error creating pool:', error);
    }
  };

  const addLiquidity = async (poolId, amount) => {
    if (!contract) return;
    try {
      const tx = await contract.addLiquidity(poolId, amount);
      await tx.wait();
      fetchPools(contract);
    } catch (error) {
      console.error('Error adding liquidity:', error);
    }
  };

  const claimRewards = async (poolId) => {
    if (!contract) return;
    try {
      const tx = await contract.claimRewards(poolId);
      await tx.wait();
      fetchPools(contract);
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
    // Initialize contract instance here if needed
  };

  return (
    <div className="container mx-auto p-4 bg-zinc-800 text-white">
      <Navbar onConnect={handleConnect} />

      <main className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 mx-auto flex pb-16 pt-16">Cowrie Network: Bringing Liquidity to ERC-1155 Tokens</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Create New Liquidity Pool (Contract must be Approved for Listings)</h2>
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
          <button onClick={createPool} className="w-full p-2 bg-green-500 hover:bg-green-700 text-white rounded duration-150">
            Create Pool
          </button>
          <p className="mt-2">Listing Fee: {network === 'Avalanche' ? '0.1 AVAX' : '0.001 ETH'}</p>
        </div>

        <h2 className="text-xl font-semibold mb-4 pt-16">Available Liquidity Pools</h2>
        <div className="grid grid-cols-7 gap-4 p-4 bg-zinc-700 rounded">
          <div className="flex font-semibold h-12 w-12"></div>
          <div className="font-semibold">Token ID</div>
          <div className="font-semibold">Total Liquidity</div>
          <div className="font-semibold">Reward Rate</div>
          <div className="font-semibold">Your LP Contribution</div>
          <div className="font-semibold">Current Rewards</div>
          <div className="font-semibold text-center">Actions</div>
        </div>
        <div className=''>
        <ul className="space-y-4">
          {pools.map((pool) => (
            <li key={pool.id} className="flex items-center p-4 border-y border-gray-300 rounded">
              <div className='flex mx-auto'><img src={pool.imageUrl} alt={`Token ${pool.tokenId}`} className="w-12 h-12" /></div>
              <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                <p className='mx-auto'>{pool.tokenId}</p>
                <p className='mx-auto'>${pool.totalLiquidity}</p>
                <p className='mx-auto'>{pool.rewardRate}</p>
                <p className='mx-auto'>{pool.yourLockedLP}</p>
                <p className='mx-auto'>{pool.rewards}</p>
              </div>
              <div className="flex flex-col space-y-2 w-48">
                <input type="text" placeholder="Amount" className="p-2 mb-2 border border-zinc-600 bg-zinc-700 text-white rounded" />
           
               
                <button onClick={() => buyTokens(pool.id, 100 /* example amount */)} className="mt-4 p-2 bg-green-500 hover:bg-green-400 duration-150 text-white rounded">
                  Buy
                </button>
                <button onClick={() => sellTokens(pool.id, 100 /* example amount */)} className="p-2 bg-green-600 hover:bg-green-500 duration-150 text-white rounded">
                  Sell
                </button>
                <button onClick={() => addLiquidity(pool.id, 100 /* example amount */)} className="p-2 bg-green-700 hover:bg-green-600 duration-150 text-white rounded">
                  Provide LP
                </button>
                <button onClick={() => claimRewards(pool.id)} className="p-2 bg-green-800 hover:bg-green-700 duration-150 text-white rounded">
                  Claim LP Rewards
                </button>
              </div>
            </li>
          ))}
        </ul></div>
      </main>
     
    </div>
    
  );
};

export default Home;
