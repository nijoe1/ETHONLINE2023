import { FunctionComponent, useEffect, useState } from "react";
import "./Relay.css";
import { CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material';
import { NATIVE_TOKEN, getStatus, relayTx } from "../../../logic/sample";
import { SafeMultisigTransaction } from "../../../logic/services";
import { buildExecuteTx } from "../../../logic/safe";

enum Status {
    Loading,
    Error,
    Ready
}

const dialogContent = (status: Status) => {
    switch(status) {
        case Status.Loading:
            return (
                <CircularProgress />
            )
        case Status.Error:
            return (
                <Typography variant="body1">
                    Error Relaying Data
                </Typography>
            )
        case Status.Ready:
            return (<>
                <Typography variant="body1">
                    Transaction has been relayed
                </Typography>
            </>)
    }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const isErrorTaskState = (state: string): boolean => {
    return [
        "ExecReverted",
        "Blacklisted",
        "Cancelled",
        "NotFound"
    ].includes(state)
}

export const RelayDialog: FunctionComponent<{ safeAddress: string , feeToken: string|undefined, handleClose: () => void }> = ({  safeAddress, feeToken, handleClose }) => {
    const [ status, setStatus ] = useState<Status>(Status.Loading)
    useEffect(() => {
        setStatus(Status.Loading)
        const fetchData = async() => {
            try {
                // TODO: remove fallback to native fee token and enforce that token is selected
                const txId = await relayTx(safeAddress, feeToken || NATIVE_TOKEN)
                let retries = 0;
                while(retries < 60) {
                    const relayStatus = await getStatus(txId)
                    console.log({relayStatus})
                    /*
                    CheckPending = "CheckPending",
                    ExecPending = "ExecPending",
                    ExecSuccess = "ExecSuccess",
                    ExecReverted = "ExecReverted",
                    WaitingForConfirmation = "WaitingForConfirmation",
                    Blacklisted = "Blacklisted",
                    Cancelled = "Cancelled",
                    NotFound = "NotFound"
                    */
                    if (relayStatus == undefined || isErrorTaskState(relayStatus.taskState)) {
                        setStatus(Status.Error)
                        return
                    } else if (relayStatus.taskState === "ExecSuccess") {
                        setStatus(Status.Ready)
                        return
                    } else {
                        retries ++;
                        await sleep(5000)
                    }
                }
                setStatus(Status.Error)
            } catch (e) {
                console.error(e)
                setStatus(Status.Error)
            }
        }
        fetchData();
    }, [setStatus,  feeToken])
    
    return <Dialog onClose={handleClose} open={true}>
      <DialogTitle>Relaying Transaction</DialogTitle>
      <DialogContent>
          {dialogContent(status)}
        </DialogContent>
        {status != Status.Loading && <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>}
    </Dialog>
    
};
