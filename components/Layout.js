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
    <div className='bg-zinc-800 bg-opacity-10'>
      <main>
        {React.cloneElement(children, { provider, account, contract })}
      </main>
      <div className="fixed w-48 h-48 bottom-[-80px] left-[-60px] bg-green-500 rounded-full z-[0] opacity-30 duration-500 md:w-96 md:h-96 pulse-animation"></div>
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.25);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
        }
        .pulse-animation {
          animation: pulse 7s infinite;
        }
      `}</style>
    </div>
  );
};

export default Layout;
