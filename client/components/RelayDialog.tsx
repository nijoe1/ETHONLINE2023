//   @ts-ignore
import { FunctionComponent, useEffect, useState } from "react";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  //   @ts-ignore
} from "@mui/material";
import { NATIVE_TOKEN, getStatus, relayTx } from "../lib/relay";
//   @ts-ignore
import { useAccount, usePublicClient } from "wagmi";

enum Status {
  Loading,
  Error,
  Ready,
}

const dialogContent = (status: Status) => {
  switch (status) {
    case Status.Loading:
      return <CircularProgress />;
    case Status.Error:
      return <Typography variant="body1">Error Relaying Data</Typography>;
    case Status.Ready:
      return (
        <>
          <Typography variant="body1">Transaction has been relayed</Typography>
        </>
      );
  }
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const isErrorTaskState = (state: string|undefined): boolean => {
  return ["ExecReverted", "Blacklisted", "Cancelled", "NotFound"].includes(
    state || ""
  );
};

export const RelayDialog: FunctionComponent<{
  safeAddress: string;
  feeToken: string | undefined;
  to: string;
  abi: string;
  func: string;
  args: any[];
  proofs: string;

  handleClose: () => void;
  //   @ts-ignore
}> = ({ safeAddress, to, abi, func, args, proofs, handleClose }) => {
  const { connector } = useAccount();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      let provider = await connector?.getProvider();
      console.log(provider);
      if (status == Status.Loading) {
        try {
          // TODO: remove fallback to native fee token and enforce that token is selected
          const txId = await relayTx(
            to,
            abi,
            func,
            args,
            safeAddress,
            address,
            proofs
          );
          console.log(txId);
          let retries = 0;
          while (retries < 60) {
            const relayStatus = await getStatus(txId);
            console.log({ relayStatus });
            if (retries > 3 && isErrorTaskState(relayStatus?.taskState || undefined)) {
              setStatus(Status?.Ready);
              return;
            } else if (relayStatus?.taskState === "ExecSuccess") {
              setStatus(Status?.Ready);
              return;
            } else {
              retries++;
              await sleep(5000);
            }
          }
          setStatus(Status.Error);
        } catch (e) {
          console.error(e);
          setStatus(Status.Error);
        }
      }
    };

    fetchData();
  }, [setStatus,open]);

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
          setStatus(Status.Loading);
        }}
      >
        relay
      </Button>
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>Relaying Transaction</DialogTitle>
        <DialogContent>{dialogContent(status)}</DialogContent>
        {status != Status.Loading && (
          <DialogActions>
            <Button
              onClick={() => {
                setOpen(false);
              }}
              autoFocus
            >
              Close
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};
