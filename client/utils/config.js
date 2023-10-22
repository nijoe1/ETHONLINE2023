import { goerli } from "wagmi/chains";

export const ETH_CHAINS = [
  {
    ...goerli,
  },
];
export const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

export const SITE_NAME = "ZK-Safe-Paymaster";
export const SITE_DESCRIPTION =
  "Most Decentralized ZKPaymaster uing Safe-Gelato-Sismo";
export const SITE_URL = "https://zksafepaymaster.vercel.app";

export const ironOptions = {
  cookieName: SITE_NAME,
  password:
    process.env.SESSION_PASSWORD ??
    "set_a_complex_password_at_least_32_characters_long",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};