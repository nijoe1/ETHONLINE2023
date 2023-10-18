import { Button } from '@material-tailwind/react';
import { useSismoConnect } from '@sismo-core/sismo-connect-react';
import { FC, useEffect, useState } from "react";
import { encodeAbiParameters } from 'viem';
import { useAccount } from "wagmi";
const CONFIG_SISMO = {
  config: {
    appId: process.env.NEXT_PUBLIC_SISMO || "",
  },

};



interface SismoProps {
  data: any
  nextStep: (step: number) => void
  getProof: (proof: string) => void
}

export const SismoProof: FC<SismoProps> = ({ data, nextStep, getProof }) => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const { sismoConnect, responseBytes: sismoProof } = useSismoConnect(CONFIG_SISMO);


  const onSismoConnect = () => {
    if (!address) {
      return;
    }


    setLoading(true);
   

    sismoConnect.request({
      auths: data.auths,
      claims: data.claims,
      signature: { message: encodeAbiParameters([{ type: 'address' }], [address]) },
    });
    setLoading(false);
  };

  useEffect(() => {

    if (sismoProof) {

      //validateProof();
      getProof(sismoProof);
      nextStep(1);

    }

  }, [sismoProof]);
  

  return (
    <>
      {sismoProof ? (
        <Button disabled={loading} onClick={() => nextStep(1)} >
          Proof accepted | continue
        </Button >
      ) : (
        <Button onClick={onSismoConnect} disabled={loading}>
          Sismo Connect
        </Button>
      )}

    </>



  )
}