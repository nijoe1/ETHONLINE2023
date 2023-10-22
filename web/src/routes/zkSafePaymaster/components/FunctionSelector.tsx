// FunctionSelector.js
import React, { useState, useEffect, useCallback } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { Interface, parseUnits, isBytesLike, getAddress } from "ethers";
import { uploadMetadata } from "../../../lib/uploadMetadata";
import { setAllowedInteractions } from "../../../logic/sample";
import { getSafeInfo } from "../../../logic/safeapp";

interface FunctionData {
  index: number;
  name: string;
  parameters: string;
}

interface FunctionSelectorProps {
  formData:any
  functionData: FunctionData[];
  updateInputValues: (name: string[], value: any[]) => void;
  abi: string;
}

const FunctionSelector: React.FC<FunctionSelectorProps> = ({
  formData,
  functionData,
  updateInputValues,
  abi,
}) => {
  const [functionSelectedStates, setFunctionSelectedStates] = useState<
    boolean[]
  >(new Array(functionData.length).fill(false));
  const [update, setUpdate] = useState(false);
  const [times, setTimes] = useState(0);

  useEffect(() => {
    // Debug the functionSelectedStates and functionData
    console.log("functionSelectedStates: ", functionSelectedStates);
    console.log("functionData: ", functionData);
  }, [functionSelectedStates, functionData]);

  const setAllowedInteractionCalls = async () => {
    let data = formData;
    const sismoGroups = [];
    if (data.groups != undefined) {
      for (let i = 0; i < data.groups.length; i++) {
        // @ts-ignore
        if (data.groups[i].id != undefined) {
          // @ts-ignore
          sismoGroups.push(data.groups[i].id);
        }
      }
    }
    console.log(sismoGroups, " :  ", data);
    let res = await uploadMetadata(data);
    console.log(res);

    await setAllowedInteractions(
      (await getSafeInfo()).safeAddress,
      data.address,
      data.methods,
      sismoGroups,
      1,
      res as unknown as string
    );
  };

  const handleSelectFunction = (index: number) => {
    
    // Create a new array with the updated selected states
    const updatedSelectedStates = [...functionSelectedStates];
    updatedSelectedStates[index] = !updatedSelectedStates[index];
    setFunctionSelectedStates(updatedSelectedStates);
    setUpdate(!(update))
    handleSelectFunctions(updatedSelectedStates, index);
  };

  const handleSelectFunctions = (
    selectedFunctions: boolean[],
    indexx: number
  ) => {
    console.log("functionSelectedStates: ", functionSelectedStates);

    const methodIDs = selectedFunctions
      .map((selected, index) => {
        if (selected) {
          console.log(index);
          const funcSig = `function ${functionData[index].name} (${functionData[index].parameters})`;
          const temp = generateInterfaceIfValid(functionData[index].name);

          return { methodID: temp, func: funcSig };
        }
        return null;
      })
      .filter((item) => item !== null);

    // Update the parent component with method IDs and functions
    updateInputValues(
      ["methods", "functions"],
      [
        methodIDs.map((item) => item?.methodID),
        methodIDs.map((item) => item?.func),
      ]
    );
    setFunctionSelectedStates(selectedFunctions);

  };

  function generateInterfaceIfValid(input: string): any | null {
    try {
      let iFace = new Interface(abi || "");
      return iFace.getFunction(input)?.selector;
    } catch (e) {
      return null;
    }
  }

  return (
    <div>
      {functionData.length !== 0 ? (
        <div>
          <Typography variant="h5" style={{ marginTop: "20px" }}>
            Select Functions:
          </Typography>
          <table
            className="border rounded-lg p-2"
            style={{ width: "100%", marginTop: "10px" }}
          >
            <thead>
              <tr></tr>
            </thead>
            <tbody>
              {functionData.map((func, index) => (
                <tr key={func.index}>
                  <td>{`function ${func.name}(${func.parameters})`}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={functionSelectedStates[index]}
                      onChange={() => {
                        handleSelectFunction(index);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <span className="mt-4">include the contract abi</span>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
        }}
      >
        <Button
          type="submit"
          color="blue"
          size="lg"
          onClick={setAllowedInteractionCalls}
          disabled={false}
        >
          Allow Functions
        </Button>
      </div>
    </div>
  );
};

export default FunctionSelector;
