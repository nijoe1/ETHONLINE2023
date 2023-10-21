import React, { useState, useEffect, FormEvent, useCallback } from "react";

import { parseAbiToFunction } from "../../lib/abiParse";
import SponsorRequirements from "./sismo/SponsorRequirements";
import {
  ClaimRequest,
  ClaimType,
  RequestBuilder,
} from "@sismo-core/sismo-connect-react";
import { SafeInfo } from "@safe-global/safe-apps-sdk";

import "./Plugins.css";
import logo from "../../logo.svg";
import FunctionSelector from "./components/FunctionSelector";
import Details from "./components/Details";
import Steps from "./components/Steps";
import { Interface, parseUnits, isBytesLike } from "ethers";
import { getSafeInfo, isConnectedToSafe } from "../../logic/safeapp";
import {
  isKnownSamplePlugin,
  setAllowedInteractions,
} from "../../logic/sample";
import { useParams } from "react-router-dom";

interface FunctionData {
  index: number;
  name: string;
  parameters: string;
}

export default function CreateApp() {
  const { pluginAddress } = useParams();
  const [safeInfo, setSafeInfo] = useState<SafeInfo | undefined>(undefined);
  const [functionData, setFunctionData] = useState<FunctionData[]>([]);
  const [selectedFunctionIndexes, setSelectedFunctionIndexes] = useState<
    number[]
  >([]);
  const [activeStep, setActiveStep] = useState(0);
  const [abiFunctions, setAbiFunctions] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    abi: "",
    groups: groups,
    cid: "",
    functions: [] as string[], // Define the type as an array of strings
    methods: [] as string[], // Define the type as an array of strings
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!(await isConnectedToSafe())) throw Error("Not connected to Safe");
        const info = await getSafeInfo();
        if (!isKnownSamplePlugin(info.chainId, pluginAddress!!))
          throw Error("Unknown Plugin");
        setSafeInfo(info);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [pluginAddress]);

  const setAllowedInteractionsCalls = useCallback(async () => {
    const info = await getSafeInfo();
    console.log(info)
    const sismoGroups = [];
    // if (groups != undefined) {
    //   for (let i = 0; i < groups.length; i++) {
    //     if (groups[i] != undefined) {
    //       sismoGroups.push({
    //         claimType: 0,
    //         groupId: groups[i].id,
    //         groupTimestamp: "0x6c61746573740000000000000000000",
    //         isOptional: false,
    //         isSelecterdByUser: true,
    //         extraData: "0x00",
    //       });
    //     }
    //   }
    // }
    sismoGroups.push({
      claimType: 0,
      groupId: "0x3a49d2e9734722a24b127b610f894639",
      groupTimestamp: "0x6c61746573740000000000000000000",
      isOptional: false,
      isSelecterdByUser: true,
      extraData: "0x00",
    });
    let methods = []
    methods.push('0x573c0bd3')
    console.log(sismoGroups, " :  ",formData)
    await setAllowedInteractions(
      info.safeAddress,
      "0xd8af3FE1314d5E8A1f2B0292521745b44Ec0DA59",
      methods,
      sismoGroups,
      1,
      " khgkhghg"
    );
  }, []);

  function generateInterfaceIfValid(input: string): any | null {
    try {
      let iFace = new Interface(formData.abi);
      return iFace.getFunction(input)?.selector;
    } catch (e) {
      return null;
    }
  }

  const nextStep = (step: number) => {
    if (step === -1) {
      // Handle form submission or navigation logic
    }
    console.log(step);
    setActiveStep(step);
  };

  const addGroup = (group: any) => {
    console.log("Show me what it is us");
    console.log(group);
    if (!groups) {
      setGroups([group]);
    } else {
      setGroups([...groups, group]);
    }
    handleChange("groups", groups);
  };

  const removeGroup = (id: string) => {
    console.log("Remove group");
    console.log(id);
    const newGroups = groups?.filter((group) => group.id !== id);
    handleChange("groups", newGroups);
    setGroups(newGroups);
  };

  const handleSelectFunctions = (selectedFunctions: boolean[]) => {
    const selectedIndexes = selectedFunctions
      .map((selected, index) => (selected ? index : -1))
      .filter((index) => index !== -1);
    setSelectedFunctionIndexes(selectedIndexes);

    let methodIDs: any[] = [];
    let Functions: any[] = [];
    for (const item of selectedIndexes) {
      let funcSig = `function ${functionData[item].name} (${functionData[item].parameters})`;
      let temp = generateInterfaceIfValid(functionData[item].name);
      if (temp) {
        methodIDs.push(temp);
        Functions.push(funcSig);
      }
    }
    setFormData((prevData) => ({
      ...prevData,
      methods: methodIDs,
      functions: Functions,
    }));
  };

  useEffect(() => {
    // Validate ABI and set function data
    if (formData.abi) {
      try {
        const parsedAbi = parseAbiToFunction(formData.abi).filteredAbi;
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
      } catch (e) {
        setFunctionData([]);
      }
    }
  }, [formData, selectedFunctionIndexes, groups]);

  const handleChange = (name: string, value: any) => {
    // Update form data with the new value
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    console.log(formData);
    console.log(functionData);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission
  };

  const cardStyle = {
    width: "100%", // Adjust the width as needed
    padding: "20px",
    borderRadius: "10px", // Rounded corners
    backgroundColor: "#333", // Light gray card color
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", // Box shadow
  };

  const headerStyle = {
    // backgroundColor: '#333', // Darker gray header background
    color: "white", // White text color
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: "20px",
  };

  const textInputStyle = {
    border: "1px solid gray", // Gray border for text inputs
    padding: "5px",
    marginBottom: "10px",
  };
  const updateName = (value: any) => {
    updateInputValue("name", value);
  };

  const updateDescription = (value: any) => {
    updateInputValue("description", value);
  };

  const updateAddress = (value: any) => {
    updateInputValue("address", value);
  };

  const updateAbi = (value: any) => {
    updateInputValue("abi", value);
  };
  const updateInputValue = (name: any, value: any) => {
    // Create a copy of the formData and update the specific input value
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
  };

  const steps = [
    {
      name: "Form Details",
      component: (
        <Details
          formData={formData}
          updateName={updateName}
          updateDescription={updateDescription}
          updateAddress={updateAddress}
          updateAbi={updateAbi}
          textInputStyle={textInputStyle}
        />
      ),
    },

    {
      name: "zkProofs",
      component: (
        <SponsorRequirements
          nextStep={nextStep}
          addGroup={addGroup}
          groups={groups}
          removeGroup={removeGroup}
        />
      ),
    },
    {
      name: "Select methods",
      component: (
        <FunctionSelector
          setAllowedInteractionCalls={setAllowedInteractionsCalls}
          functionData={functionData}
          selectedFunctionIndexes={selectedFunctionIndexes}
          onHandleSelectFunction={handleSelectFunctions}
        />
      ),
    },
  ];

  return (
    <div className="Plugins">
      {/* @ts-ignore */}
      <header className="flex flex-col items-center" style={headerStyle}>
        <img
          src={logo}
          style={{
            height: "40pt",
            pointerEvents: "none",
          }}
          alt="logo"
        />
        <p>ZK-Safe-Paymaster</p>
      </header>
      <div>
        <div style={cardStyle}>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Steps steps={steps} activeStep={activeStep} nextStep={nextStep} />
            <div className="mt-10">{steps[activeStep].component}</div>
            <div className="flex flex-wrap justify-betwwen">
              {activeStep >= 1 && (
                <button onClick={() => nextStep(activeStep - 1)}>prev</button>
              )}
              {activeStep <= 1 && (
                <button onClick={() => nextStep(activeStep + 1)}>next</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
