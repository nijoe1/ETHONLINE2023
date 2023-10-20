// FunctionSelector.js
import React, { useState, useEffect } from "react";
import { Typography, Button } from "@material-tailwind/react";

interface FunctionData {
  index: number;
  name: string;
  parameters: string;
}

interface FunctionSelectorProps {
  functionData: FunctionData[];
  onHandleSelectFunction: (selectedFunctions: boolean[]) => void;
  setAllowedInteractionCalls: () => void;
  selectedFunctionIndexes: number[];
}

const FunctionSelector: React.FC<FunctionSelectorProps> = ({
  functionData,
  onHandleSelectFunction,
  setAllowedInteractionCalls,
  selectedFunctionIndexes,
}) => {
  const [functionSelectedStates, setFunctionSelectedStates] = useState<boolean[]>(
    new Array(functionData.length).fill(false)
  );

  useEffect(() => {
    // Update the selected functions based on selectedFunctionIndexes
    const updatedSelectedStates = new Array(functionData.length).fill(false);
    selectedFunctionIndexes.forEach((index) => {
      updatedSelectedStates[index] = true;
    });
    setFunctionSelectedStates(updatedSelectedStates);
  }, [selectedFunctionIndexes, functionData]);

  const handleSelectFunction = (index: number) => {
    const updatedSelectedStates = [...functionSelectedStates];
    updatedSelectedStates[index] = !updatedSelectedStates[index];
    setFunctionSelectedStates(updatedSelectedStates);

    // Pass the updated selection states to the parent
    onHandleSelectFunction(updatedSelectedStates);
  };

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
                      onChange={() => handleSelectFunction(index)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <span>Add Abi</span>
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