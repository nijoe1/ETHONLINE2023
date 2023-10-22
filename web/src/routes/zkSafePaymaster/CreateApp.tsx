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
import { Interface, parseUnits, isBytesLike, getAddress } from "ethers";
import { getSafeInfo, isConnectedToSafe } from "../../logic/safeapp";
import pluginAbi from "../../logic/SafePaymasterPlugin.json";

import {
  isKnownSamplePlugin,
  setAllowedInteractions,
} from "../../logic/sample";
import { useParams } from "react-router-dom";

import { uploadMetadata } from "../../lib/uploadMetadata";

interface FunctionData {
  index: number;
  name: string;
  parameters: string;
}
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

export default function CreateApp() {
  const { pluginAddress } = useParams();
  const [safeInfo, setSafeInfo] = useState<SafeInfo | undefined>(undefined);
  const [functionData, setFunctionData] = useState<FunctionData[]>([]);
  const [update, setUpdate] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [abiFunctions, setAbiFunctions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    abi: "",
    groups: [],
    cid: "",
    functions: [] as string[], // Define the type as an array of strings
    methods: [] as string[], // Define the type as an array of strings
  });

  const updateInputValue = (name: any, value: any) => {
    // Update form data with the new value
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    setUpdate(!update);

    console.log(formData);
    console.log(functionData);
  };

  const updateInputValues = (name: any[], value: any[]) => {
    // Update form data with the new value
    setFormData((prevData) => ({
      ...prevData,
      [name[0]]: value[0],
      [name[1]]: value[1],
    }));
    setUpdate(!update);
    console.log(formData);
    console.log(functionData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!(await isConnectedToSafe())) throw Error("Not connected to Safe");
        const info = await getSafeInfo();
        setSafeInfo(info);
        if (!isKnownSamplePlugin(info.chainId, getAddress(pluginAbi.address)!!))
          throw Error("Unknown Plugin");
        setSafeInfo(info);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [pluginAddress]);

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
  }, [formData.abi]);

  useEffect(() => {}, [update, formData]);

  const setAllowedInteractionCalls = useCallback(async () => {
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
      (
        await getSafeInfo()
      ).safeAddress,
      data.address,
      data.methods,
      sismoGroups,
      1,
      res as unknown as string
    );
  }, []);

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
    updateInputValue("groups", [...formData.groups, group]);
  };

  const removeGroup = (id: string) => {
    console.log("Remove group");
    console.log(id);
    // @ts-ignore
    const newGroups = formData.groups?.filter((group) => group.id !== id);
    updateInputValue("groups", newGroups);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission
  };

  const steps = [
    {
      name: "Form Details",
      component: (
        <Details formData={formData} updateInputValue={updateInputValue} />
      ),
    },

    {
      name: "zkProofs",
      component: (
        <SponsorRequirements
          updateInputValue={updateInputValue}
          addGroup={addGroup}
          groups={formData.groups}
          removeGroup={removeGroup}
        />
      ),
    },
    {
      name: "Select methods",
      component: (
        <FunctionSelector
          formData={formData}
          functionData={functionData}
          updateInputValues={updateInputValues}
          abi={formData.abi}
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
