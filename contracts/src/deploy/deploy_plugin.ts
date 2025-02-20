import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getGelatoAddress } from "@gelatonetwork/relay-context";
import { ZeroAddress } from "ethers";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deployer, recoverer } = await getNamedAccounts();
    const { deploy } = deployments;

    // execTransaction(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes)
    // https://www.4byte.directory/signatures/?bytes4_signature=0x6a761202

    const sismoAppID = "0x2d31f5ac41cdeba21728cca8842ff2f7";
    // We don't use a trusted origin right now to make it easier to test.
    // For production networks it is strongly recommended to set one to avoid potential fee extraction.
    // const trustedOrigin = getGelatoAddress(hre.network.name)
    console.log(deployer);
    const TablelandIndexer = await deploy("ZKSafePaymasterIndexer", {
        from: deployer,
        args: [],
        log: true,
        deterministicDeployment: false,
    });
    const SafePaymasterPlugin = await deploy("SafePaymasterPlugin", {
        from: deployer,
        args: [TablelandIndexer.address, sismoAppID],
        log: true,
        deterministicDeployment: true,
    });

    const tablelandIndexer = await hre.ethers.getContractFactory("ZKSafePaymasterIndexer");
    const TablelandIndexerInstance = tablelandIndexer.attach(TablelandIndexer.address);

    let makeRegistryOwner = await TablelandIndexerInstance.transferOwnership(SafePaymasterPlugin.address);
    await makeRegistryOwner.wait();

};

deploy.tags = ["plugins"];
export default deploy;