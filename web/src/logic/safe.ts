import { ethers, BigNumberish, getAddress, ZeroAddress } from "ethers"
import { getProvider } from "./web3";
import { BaseTransaction } from '@safe-global/safe-apps-sdk';
import { SafeMultisigConfirmation, SafeMultisigTransaction } from "./services";

const SAFE_ABI = [
    "function isModuleEnabled(address module) public view returns (bool)",
    "function nonce() public view returns (uint256)",
    "function enableModule(address module) public",
    "function execTransaction(address to,uint256 value,bytes calldata data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address payable refundReceiver,bytes memory signatures) public payable returns (bool success)"
]

// TODO: use safe-core-sdk here once Ethers v6 is supported
const getSafe = async(address: string) => {
    const provider = await getProvider()
    return new ethers.Contract(
        address,
        SAFE_ABI,
        provider
    )
}

export const isModuleEnabled = async(safeAddress: string, module: string): Promise<boolean> => {
    const safe = await getSafe(safeAddress)
    return await safe.isModuleEnabled(module)
} 

export const getCurrentNonce = async(safeAddress: string): Promise<BigNumberish> => {
    const safe = await getSafe(safeAddress)
    return await safe.nonce()
} 

export const buildEnableModule = async(safeAddress: string, module: string): Promise<BaseTransaction> => {
    const safe = await getSafe(safeAddress)
    return {
        to: safeAddress,
        value: "0",
        data: (await safe.enableModule.populateTransaction(module)).data
    }
} 

export const buildSignatureBytes = (signatures: SafeMultisigConfirmation[]): string => {
    const SIGNATURE_LENGTH_BYTES = 65;
    signatures.sort((left, right) => left.owner.toLowerCase().localeCompare(right.owner.toLowerCase()));

    let signatureBytes = "0x";
    let dynamicBytes = "";
    for (const sig of signatures) {
        if (sig.signatureType === "CONTRACT_SIGNATURE") {
            /* 
                A contract signature has a static part of 65 bytes and the dynamic part that needs to be appended at the end of 
                end signature bytes.
                The signature format is
                Signature type == 0
                Constant part: 65 bytes
                {32-bytes signature verifier}{32-bytes dynamic data position}{1-byte signature type}
                Dynamic part (solidity bytes): 32 bytes + signature data length
                {32-bytes signature length}{bytes signature data}
            */
            const dynamicPartPosition = (signatures.length * SIGNATURE_LENGTH_BYTES + dynamicBytes.length / 2)
                .toString(16)
                .padStart(64, "0");
            const dynamicPartLength = (sig.signature.slice(2).length / 2).toString(16).padStart(64, "0");
            const staticSignature = `${sig.owner.slice(2).padStart(64, "0")}${dynamicPartPosition}00`;
            const dynamicPartWithLength = `${dynamicPartLength}${sig.signature.slice(2)}`;

            signatureBytes += staticSignature;
            dynamicBytes += dynamicPartWithLength;
        } else {
            signatureBytes += sig.signature.slice(2);
        }
    }

    return signatureBytes + dynamicBytes;
};

export const buildExecuteTx = async (tx: SafeMultisigTransaction): Promise<{to: string}> => {
    return {
        to: getAddress(tx.safe),
    }
}