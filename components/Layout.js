// components/Layout.js
import React, { useState } from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  const handleConnect = (provider, account, contract) => {
    setProvider(provider);
    setAccount(account);
    setContract(contract);
  };

  return (
    <div className='bg-zinc-800'>
    
      <main>
        {React.cloneElement(children, { provider, account, contract })}
      </main>
      <div className="fixed w-96 h-96 bottom-[-80px] left-[-60px] bg-green-500 rounded-full z-50 opacity-30 hover:opacity-100 hover:scale-150 duration-500"></div>
    </div>
  );
};

export default Layout;
