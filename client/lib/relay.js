import { ethers, getAddress } from "ethers";
import { getProvider, getProvider2 } from "../logic/web3";
import { GelatoRelay } from "@gelatonetwork/relay-sdk";
import pluginAbi from "../logic/SafePaymasterPlugin.json";
import { getManager } from "../logic/protocol";
import * as crypto from "crypto";

function getRandomUint() {
  const randomBytes = crypto.randomBytes(4); // 4 bytes = 32 bits
  return randomBytes.readUInt32BE(0);
}
const SAMPLE_PLUGIN_CHAIN_ID = 5;
const SAMPLE_PLUGIN_ADDRESS = "0x41ab201CcD683B46E37734c59b461c64F7DfE3CE";
export const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const SAMPLE_PLUGIN_ABI = [
  "function setAllowedInteractions( address safeAddress, address contractAddress, bytes4[] calldata  methods, ClaimRequest[] calldata _claims, uint256 _timesPerAddress, string memory guardMetadataCID) external",
  "function deleteAllowedInteractions(address safeAddress,address contractAddress,bytes4[] calldata  methods,string memory guardMetadataCID) external",
  "function executeFromPlugin(address manager, address safe, SafeTransaction calldata safetx, bytes memory proofs) external",
];
const ECR20_ABI = [
  "function decimals() public view returns (uint256 decimals)",
  "function symbol() public view returns (string symbol)",
];

const TEST_ABI = ["function updateValue(uint val) external"];

const gelato = new GelatoRelay();

const getRelayPlugin = async (args) => {
  let iface = new ethers.utils.Interface(pluginAbi.abi);
  let data1 = iface.encodeFunctionData("executeFromPlugin", args);
  return data1;
};

const getContract = async () => {
  const provider = await getProvider2();
  return new ethers.Contract(pluginAbi.address, pluginAbi.abi, provider);
};

export const getTransaction = async (address, abi, func, args) => {
  let iface = new ethers.utils.Interface(abi);
  const args2 = [];
  for (const arg of args) {
    args2.push(parseInt(arg));
  }
  let data1 = iface.encodeFunctionData(func, args2);
  console.log(data1);
  let nonce = getRandomUint();
  console.log(nonce);
  let actions = [];
  actions.push({ to: address, value: 0, data: data1 });
  return {
    actions: actions,
    nonce: getRandomUint(),
    metadataHash:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
  };
};

export const relayTx = async (
  to,
  abi,
  func,
  args,
  safeAddress,
  userAddress,
  proofs
) => {
  try {
    const manager = await getManager();
    const tx = await getTransaction(to, abi, "updateValue(uint val)", args);
    const plugin = await getRelayPlugin([manager, safeAddress, tx, proofs]);
    console.log(func, args);
    // address of the token to pay fees
    const feeToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const chainId = (await provider.getNetwork()).chainId;

    // populate the relay SDK request body
    const request = {
      chainId: chainId,
      target: SAMPLE_PLUGIN_ADDRESS,
      data: plugin,
      user: userAddress,
      feeToken: feeToken,
      isRelayContext: true,
    };

    console.log({ request });
    const response = await gelato.callWithSyncFeeERC2771(request, provider);
    console.log(response);
    return response.taskId;
  } catch (e) {
    console.error(e);
    return "";
  }
};

export const getStatus = async (taskId) => {
  try {
    return await gelato.getTaskStatus(taskId);
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

export const getAvailableFeeToken = async () => {
  return await gelato.getPaymentTokens(BigInt(SAMPLE_PLUGIN_CHAIN_ID));
};
