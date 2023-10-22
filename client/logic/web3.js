import { ethers } from "ethers"
const PROTOCOL_PUBLIC_RPC = "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
export const getProvider = async() => {
    console.log("Use JsonRpcProvider")
    return  new ethers.providers.JsonRpcProvider(PROTOCOL_PUBLIC_RPC)
}

export const getProvider2 = async() => {
    console.log("Use JsonRpcProvider")
    return new ethers.JsonRpcProvider(PROTOCOL_PUBLIC_RPC)
}