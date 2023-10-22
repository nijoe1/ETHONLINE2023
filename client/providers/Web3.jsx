/* eslint-disable react/no-children-prop */
import "@rainbow-me/rainbowkit/styles.css";
import {
  connectorsForWallets,
  RainbowKitProvider,
  lightTheme,
  darkTheme,
  midnightTheme,
} from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  trustWallet,
  walletConnectWallet,
  ledgerWallet,
  coinbaseWallet,
} from "@rainbow-me/rainbowkit/wallets";

import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

import { ETH_CHAINS, WALLET_CONNECT_PROJECT_ID } from "@/utils/config";

const projectId = WALLET_CONNECT_PROJECT_ID;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  ETH_CHAINS,
  [publicProvider()]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ projectId, chains }),
      walletConnectWallet({ projectId, chains }),
    ],
  },
  {
    groupName: "Others",
    wallets: [
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
      coinbaseWallet({ chains, appName: "DAPP KIT" }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const Web3Provider = (props) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={lightTheme({
          accentColor: "white", // Change this to your desired color
          accentColorForeground: "black",
          borderRadius: "large",
          fontStack: "system",
        })}
        appInfo={{
          appName: "ZK-Safe-Paymaster",
          learnMoreUrl: "https://github.com/nijoe1/Safe.Paymaster",
        }}
      >
        {props.children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default Web3Provider;
