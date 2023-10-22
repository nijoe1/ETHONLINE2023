import React, { useState } from "react";
import {
  Typography,
  Textarea,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { parseAbiToFunction } from "@/lib/abiParse";
import { SismoProof } from "./SismoProof";
import { RelayDialog } from "./RelayDialog";
const PaymasterItem = ({ data, address }) => {
  const [selectedFunction, setSelectedFunction] = useState("");
  const [selectedFunctions, setSelectedFunctions] = useState({});
  const [transactionStatus, setTransactionStatus] =
    useState("Create Sismo Proof");
  const { filteredAbi } = parseAbiToFunction(data.abi);
  const [bytes, setBytes] = useState();
  const [relayTime, setRelayTime] = useState(false);

  const [functionArguments, setFunctionArguments] = useState({});

  // State to store the function argument values as an array
  const [functionArgumentValues, setFunctionArgumentValues] = useState([]);

  // Function to update the function arguments
  const updateFunctionArgument = (funcName, argName, value) => {
    const updatedFunctionArguments = { ...functionArguments };
    if (!updatedFunctionArguments[funcName]) {
      updatedFunctionArguments[funcName] = {};
    }
    updatedFunctionArguments[funcName][argName] = value;

    // Convert function arguments object to an array
    const argsArray = Object.keys(updatedFunctionArguments).map((funcName) => ({
      name: funcName,
      args: updatedFunctionArguments[funcName],
    }));

    // Create an array of argument values in the right order
    const valuesArray = argsArray.flatMap((funcArgs) =>
      Object.values(funcArgs.args)
    );

    setFunctionArguments(updatedFunctionArguments);
    setFunctionArgumentValues(valuesArray);
    console.log(valuesArray);
  };

  const handleInputChange = (funcName, e) => {
    const updatedSelectedFunctions = { ...selectedFunctions };
    updatedSelectedFunctions[funcName].value = e.target.value;
    setSelectedFunctions(updatedSelectedFunctions);
  };

  const handleTransaction = () => {
    setTransactionStatus("Transaction Completed");
    setTimeout(() => {
      setTransactionStatus("Create Sismo Proof");
    }, 2000);
  };

  const setProof = (proof) => {
    setBytes(proof);
    setRelayTime(true);
    console.log(proof);
  };
  const [relayDialogOpen, setRelayDialogOpen] = useState(false);

  // Implement handleClose function
  const handleClose = () => {
    setRelayDialogOpen(false);
  };
  return (
    <div className="flex flex-col items-center">
      <Card variant="outlined" style={{ backgroundColor: "#ffff" }}>
        <CardContent>
          <Typography variant="body1" className="font-bold">
            Safe:{address}
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Get sponsored transactions from the SafePaymaster you must generate
            the underlined ZKProofs using SismoConnect if you have access!
          </Typography>

          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <Typography variant="h6" className="font-semibold">
              Required ZK Sismo-Proofs
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              If you have access to generate those proofs you can get free
              transactions provided by this Safe Wallet
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.groups.map((group, groupIndex) => (
                  <TableRow key={groupIndex}>
                    <TableCell>
                      <span
                        className="cursor-pointer text-blue-500"
                        onClick={() => {
                          navigator.clipboard.writeText(group.id);
                          alert("Copied ID to clipboard!");
                        }}
                      >
                        {group.id.substr(0, 10)}
                      </span>
                    </TableCell>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>
                      <span
                        className="cursor-pointer text-blue-500"
                        onClick={() => {
                          setSelectedDescription(group.description);
                          setShowDescriptionModal(true);
                        }}
                      >
                        {group.description}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="function-select-label">
              Select a Function
            </InputLabel>
            <Select
              labelId="function-select-label"
              id="function-select"
              value={selectedFunction}
              onChange={(e) => setSelectedFunction(e.target.value)}
              label="Select a Function"
            >
              {filteredAbi.map((func, funcIndex) => (
                <MenuItem key={funcIndex} value={func.name}>
                  {func.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div>
            {filteredAbi.map((func) => {
              if (func.name === selectedFunction) {
                return (
                  <Card variant="outlined" style={{ margin: "16px 0" }}>
                    {func.inputs.map((input, index) => (
                      <TextField
                        key={index}
                        label={`${input.name} (${input.type})`}
                        type="text"
                        onChange={(e) =>
                          updateFunctionArgument(
                            func.name,
                            input.name,
                            e.target.value
                          )
                        }
                      />
                    ))}
                  </Card>
                );
              }
              return null;
            })}
          </div>
          <div className="my-4">
            {!relayTime ? (
              <SismoProof forwardBytes={setProof} />
            ) : (
              <div>
                <RelayDialog
                  safeAddress={address}
                  to={data.address}
                  abi={data.abi}
                  func={selectedFunction}
                  args={functionArgumentValues}
                  proofs={bytes}
                  handleClose={handleClose}
                  open={relayDialogOpen}
                ></RelayDialog>
              </div>
            )}{" "}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymasterItem;
