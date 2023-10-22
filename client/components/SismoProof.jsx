import { Button } from "@material-tailwind/react";
import {
  useSismoConnect,
  SismoConnectButton,
  AuthType,
} from "@sismo-core/sismo-connect-react";
import { FC, useEffect, useState } from "react";
import { encodeAbiParameters } from "viem";
import { useAccount } from "wagmi";

export const CLAIMS = [
  {
    // Sismo Community Members
    groupId: "0x06fbb34c2de1bdfa10c8759e86be80dd",
  },
];
export const SismoProof = ({forwardBytes}) => {
  const { address } = useAccount();

  return (
    <SismoConnectButton
      config={{
        appId: "0x2d31f5ac41cdeba21728cca8842ff2f7",
      }}
      auths={[{ authType: AuthType.VAULT }]}
      // request a proof of Gitcoin Passport ownership from your users
      // pass the groupId and the minimum value required in the group
      claims={[
        {
          groupId: "0x06fbb34c2de1bdfa10c8759e86be80dd",
        },
      ]}
      signature={{
        message: encodeAbiParameters([{ type: "address" }], [address]),
      }}
      onResponseBytes={(responseBytes) => {
        forwardBytes(responseBytes)
      }}
      text={"Claim with Sismo"}
    />
  );
};
