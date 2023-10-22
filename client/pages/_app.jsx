import { SEO } from "@/components/layout";
import Web3Provider from "@/providers/Web3";

import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <Web3Provider>
      <SEO />
      <Component {...pageProps} />
    </Web3Provider>
  );
}
