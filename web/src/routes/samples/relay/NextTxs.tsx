import { FunctionComponent, useCallback, useEffect, useState } from "react";
import "./Relay.css";
import { CircularProgress, Button, Card, Typography, Tooltip } from '@mui/material';
import { getNextTxs } from "../../../logic/sample";
import { SafeInfo } from '@safe-global/safe-apps-sdk';
import { SafeMultisigTransaction } from "../../../logic/services";
import { Address } from "cluster";

enum Status {
    Loading,
    Error,
    Ready
}



const NextTxItem: FunctionComponent<{ safeAddress: string, handleRelay: () => void }> = ({handleRelay }) => {
    return (<Card className="NextTxCard">
        <Button onClick={() => handleRelay()}>Relay</Button>
    </Card>)
}

export const NextTxsList: FunctionComponent<{ safeInfo: SafeInfo, handleRelay: () => void }> = ({ safeInfo, handleRelay }) => {
    const [ status, setStatus ] = useState<Status>(Status.Ready)
    const fetchData = useCallback(async () => {
        try {
            setStatus(Status.Loading)
            
            setStatus(Status.Ready)
        } catch (e) {
            console.error(e)
            setStatus(Status.Error)
        }
    }, [setStatus, safeInfo])
    useEffect(() => {
        fetchData();
    }, [fetchData])
    
    switch(status) {
        case Status.Loading:
            return (<Card className="Notice">
                <CircularProgress />
            </Card>)
        case Status.Error:
            return (<Card className="Notice">
                <Typography variant="body1">
                    Error Loading Data
                </Typography>
            </Card>)
        case Status.Ready:
            return (<>
                <NextTxItem safeAddress={safeInfo.safeAddress} handleRelay={() => handleRelay} />
            </>)
    }
};
