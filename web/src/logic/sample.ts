import { BigNumberish, BytesLike, ethers, getAddress, ZeroAddress } from "ethers";
import { getProvider } from "./web3";
import { CallWithSyncFeeERC2771Request, GelatoRelay } from "@gelatonetwork/relay-sdk";
import { getSafeAppsProvider, submitTxs } from "./safeapp";
import { getManager } from "./protocol";
import { getCurrentNonce } from "./safe";
import pluginAbi from "./SafePaymasterPlugin.json";
import {
  getSafeMultisigTxs,
  SafeMultisigTransaction,
  SafeTransaction,
} from "./services";

type SequentialERC2771Request = {
  chainId: BigNumberish;
  target: string;
  data: BytesLike;
  user: string;
  userDeadline?: BigNumberish;
  feeToken: string;
  isRelayContext?: boolean;
  isConcurrent?: false;
  userNonce?: BigNumberish;
};

const SAMPLE_PLUGIN_CHAIN_ID = 5;
const SAMPLE_PLUGIN_ADDRESS = getAddress(
  "0xaB312E5040aDdE20A1623f1CB36682268bbeC300"
);
export const NATIVE_TOKEN = getAddress(
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
);
const SAMPLE_PLUGIN_ABI = [
  "function executeFromPlugin(ISafeProtocolManager manager, ISafe safe, SafeTransaction calldata safetx) external",
];
const ECR20_ABI = [
  "function decimals() public view returns (uint256 decimals)",
  "function symbol() public view returns (string symbol)",
];

const TEST_ABI = ["function updateValue(uint val) external"];

const gelato = new GelatoRelay();

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: bigint;
}

export const isKnownSamplePlugin = (
  chainId: number,
  address: string
): boolean =>
  ethers.toBigInt(chainId) == ethers.toBigInt(SAMPLE_PLUGIN_CHAIN_ID) &&
  getAddress(address) === SAMPLE_PLUGIN_ADDRESS;

const getRelayPlugin = async () => {
  const provider = await getProvider();
  return new ethers.Contract(SAMPLE_PLUGIN_ADDRESS, pluginAbi.abi, provider);
};

const getTest = async () => {
  const provider = await getProvider();
  return new ethers.Contract(
    "0xd8af3FE1314d5E8A1f2B0292521745b44Ec0DA59",
    TEST_ABI,
    provider
  );
};

const getToken = async (address: string) => {
  const provider = await getProvider();
  return new ethers.Contract(address, ECR20_ABI, provider);
};

export const getNextTxs = async (
  safe: string
): Promise<SafeMultisigTransaction[]> => {
  const currentNonce = await getCurrentNonce(safe);
  const { results: txs } = await getSafeMultisigTxs(safe, {
    nonce: currentNonce,
  });
  return txs;
};

export const getAvailableFeeToken = async (): Promise<string[]> => {
  return await gelato.getPaymentTokens(SAMPLE_PLUGIN_CHAIN_ID);
};

export const getMaxFeePerToken = async (
  account: string,
  token: string
): Promise<bigint> => {
  const plugin = await getRelayPlugin();
  return await plugin.maxFeePerToken(account, token);
};

export const updateMaxFeePerToken = async (token: string, maxFee: bigint) => {
  try {
    const plugin = await getRelayPlugin();
    await submitTxs([
      {
        to: await plugin.getAddress(),
        value: "0",
        data: (
          await plugin.setMaxFeePerToken.populateTransaction(token, maxFee)
        ).data,
      },
    ]);
  } catch (e) {
    console.error(e);
  }
};

export const getTokenInfo = async (address: string): Promise<TokenInfo> => {
  if (address === NATIVE_TOKEN || address === ZeroAddress)
    return {
      address,
      symbol: "ETH",
      decimals: BigInt(18),
    };
  const token = await getToken(address);
  return {
    address,
    symbol: await token.symbol(),
    decimals: await token.decimals(),
  };
};

export const getTransaction = async () => {
  const to = "0xd8af3FE1314d5E8A1f2B0292521745b44Ec0DA59";
  const test = await getTest();
  const data1 = (await test.updateValue.populateTransaction(BigInt(10))).data;

  let actions = [];
  actions.push({ to: to, value: 0, data: data1 });
  return {
    actions: actions,
    nonce: 15,
    metadataHash:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
  };
};

export const relayTx = async (account: string, feeToken: string) => {
  try {
    const tx = await getTransaction();
    const plugin = await getRelayPlugin();
    const manager = await getManager();

    const request:CallWithSyncFeeERC2771Request = {
      chainId: BigInt(SAMPLE_PLUGIN_CHAIN_ID),
      target: await plugin.getAddress(),
      data: (
        await plugin.executeFromPlugin.populateTransaction(
          await manager.getAddress(),
          account,
          tx
        )
      ).data,
      user:"user",
      feeToken,
      isRelayContext: true,
    };
    let provider = await getSafeAppsProvider()

    console.log({ request });
    const response = await gelato.callWithSyncFeeERC2771(request,provider);
    console.log(response);
    return response.taskId;
  } catch (e) {
    console.error(e);
    return "";
  }
};

export const getStatus = async (taskId: string) => {
  try {
    return await gelato.getTaskStatus(taskId);
  } catch (e) {
    console.error(e);
    return undefined;
  }
};
