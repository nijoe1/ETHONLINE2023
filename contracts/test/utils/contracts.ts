import { Addressable, BaseContract } from "ethers";
import {
    BasePlugin,
    // @ts-ignore
    TestSafeProtocolRegistryUnrestricted,
} from "../../typechain-types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getProtocolRegistryAddress } from "../../src/utils/protocol";
import { SafePaymasterPlugin } from "../../typechain-types/contracts/SafePaymasterPlugin.sol";

export const getInstance = async <T extends BaseContract>(
    hre: HardhatRuntimeEnvironment,
    name: string,
    address: string | Addressable,
): Promise<T> => {
    // TODO: this typecasting should be refactored
    return (await hre.ethers.getContractAt(name, address)) as unknown as T;
};

export const getSingleton = async <T extends BaseContract>(hre: HardhatRuntimeEnvironment, name: string): Promise<T> => {
    const deployment = await hre.deployments.get(name);
    return getInstance<T>(hre, name, deployment.address);
};

export const getPlugin = (hre: HardhatRuntimeEnvironment, address: string) => getInstance<BasePlugin>(hre, "BasePlugin", address);
export const getRelayPlugin = (hre: HardhatRuntimeEnvironment) => getSingleton<SafePaymasterPlugin>(hre, "SafePaymasterPlugin");
export const getRegistry = async (hre: HardhatRuntimeEnvironment) =>
    getInstance<TestSafeProtocolRegistryUnrestricted>(hre, "TestSafeProtocolRegistryUnrestricted", await getProtocolRegistryAddress(hre));
