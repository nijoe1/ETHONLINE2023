import React, { useState, useEffect, FormEvent } from "react";
import {
  Button,
  Select,
  Textarea,
  Input,
  Typography,
} from "@material-tailwind/react";
import { useForm } from "@mantine/form";
import { parseAbiToFunction } from "../../lib/abiParse";
import SponsorRequirements from "./sismo/SponsorRequirements";
import { IconChevronDown } from "@tabler/icons-react";
import { uploadImage } from "../../lib/uploadImage";
import { showNotification } from "@mantine/notifications";

interface FunctionOption {
  label: string;
  value: number;
}

interface SelectedFunction {
  index: number;
  func: any;
}
interface FunctionData {
  index: number;
  name: string;
  parameters: string;
}

export default function CreateApp() {
  const [functionData, setFunctionData] = useState<FunctionData[]>([]);
  const [selectedFunctionIndexes, setSelectedFunctionIndexes] = useState<
    number[]
  >([]);
  const [abiFunctions, setAbiFunctions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>();
  const addGroup = (group: any) => {
    console.log("show me what it is us");
    console.log(group);
    //it it in the group
    if (groups == undefined) {
      //add in existing group
      setGroups([group]);
      return;
    }
    setGroups((prev: any) => [...prev, group]);
  };

  const removeGroup = (id: string) => {
    console.log("remove group");
    console.log(id);
    let newGroups = groups?.filter((group) => group.id !== id);
    setGroups(newGroups);
  };
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      website: "",
      abi: "",
      id: "",
    },
    validate: {
      abi: (value) => (validateAbiInput(value) ? undefined : "Invalid ABI"),
      // @ts-ignore
      functionName: (value) =>
        selectedFunctionIndexes.length > 0
          ? undefined
          : "Select at least one function",
    },
    validateInputOnChange: true,
  });

  useEffect(() => {
    if (form.values.abi) {
      validateAbiInput(form.values.abi);
    }
  }, [form.values.abi]);

  const validateAbiInput = (abi: string) => {
    try {
      const parsedAbi = parseAbiToFunction(abi).filteredAbi;
      setAbiFunctions(parsedAbi);
      const functions = parsedAbi.map((abiFunction: any, index: number) => {
        return {
          index,
          name: abiFunction.name,
          parameters: abiFunction.inputs
            .map((input: any) => input.type)
            .join(", "),
        };
      });
      setFunctionData(functions);
      return true;
    } catch (e) {
      setFunctionData([]);
      return false;
    }
  };

  const handleSelectFunction = (index: number) => {
    setSelectedFunctionIndexes((prevIndexes) => {
      const indexInArray = prevIndexes.indexOf(index);
      if (indexInArray === -1) {
        return [...prevIndexes, index];
      } else {
        return prevIndexes.filter((item) => item !== index);
      }
    });
  };

  const handleRemoveFunction = (index: number) => {
    setSelectedFunctionIndexes((prevIndexes) =>
      prevIndexes.filter((item) => item !== index)
    );
  };
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="max-w-2xl flex flex-col items-center w-full border border-gray-300 p-6 rounded-lg bg-white">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center mt-6 w-full max-w-md"
      >
        <label htmlFor="appName" className="block mb-1 text-lg font-medium">
          App Name
        </label>
        <Input
          id="appName"
          placeholder="Enter the name of the app"
          required
          {...form.getInputProps("name")}
        />
        <label
          htmlFor="appDescription"
          className="block mt-4 mb-1 text-lg font-medium"
        >
          App Description
        </label>
        <Input
          id="appDescription"
          placeholder="Enter the description of the app"
          required
          {...form.getInputProps("description")}
        />
        {/* Other input fields */}
        <Typography variant="h5" className="mt-4">
          Enter contracts ABI JSON
        </Typography>
        <Textarea
          rows={4}
          id="abiJson"
          placeholder='[{"inputs":[], "name": "myFunction", "type":"function"}]'
          required
          {...form.getInputProps("abi")}
        />

        <Typography variant="h5" className="mt-4">
          Select Functions:
        </Typography>

        <table className="w-full mt-2">
          <thead>
            <tr>
              <th>Name</th>
              <th>Parameters</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {functionData.map((func) => (
              <tr key={func.index}>
                <td>{func.name}</td>
                <td>{func.parameters}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedFunctionIndexes.includes(func.index)}
                    onChange={() => handleSelectFunction(func.index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedFunctionIndexes.length > 0 && (
          <div className="mt-6">
            <Typography variant="h2" color="blue">
              Selected Functions
            </Typography>
            {selectedFunctionIndexes.map((index) => {
              const func = abiFunctions[index];
              return (
                <div key={index} className="my-4">
                  <Typography variant="h6">{func.name}</Typography>
                  <Input
                    placeholder={func.inputs
                      .map((input: any) => input.type)
                      .join(", ")}
                    required
                    readOnly
                  />
                  <Button
                    color="red"
                    size="sm"
                    onClick={() => handleRemoveFunction(index)}
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <SponsorRequirements
          addGroup={addGroup}
          groups={groups}
          removeGroup={removeGroup}
        />

        <div className="flex justify-end mt-6">
          <Button type="submit" color="blue" size="lg" disabled={false}>
            Create App
          </Button>
        </div>
      </form>
    </div>
  );
}
