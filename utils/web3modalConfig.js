// utils/web3modalConfig.js
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

export const getProviderOptions = () => {
  const infuraId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId,
        rpc: {
          1: `https://mainnet.infura.io/v3/${infuraId}`,
          43114: "https://api.avax.network/ext/bc/C/rpc",
        },
      },
    },
    coinbasewallet: {
      package: CoinbaseWalletSDK,
      options: {
        appName: "ERC1155 LP System",
        infuraId,
        rpc: `https://mainnet.infura.io/v3/${infuraId}`,
      },
    },
  };

  return providerOptions;
};
