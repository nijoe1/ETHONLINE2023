import type { AppProps } from "next/app";
import { SEO } from "@/components/layout";

import "@/styles/globals.css";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      {/* @ts-ignore */}
      <SEO />
      {/* @ts-ignore */}
      <Component {...pageProps} />
    </div>
  );
}
