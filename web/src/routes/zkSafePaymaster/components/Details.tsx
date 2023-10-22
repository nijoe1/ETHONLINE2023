import React, { useEffect, useState } from "react";
import { Input, Textarea } from "@material-tailwind/react";

interface DetailsProps {
  formData: any;
  updateInputValue: (name: string, value: string) => void;
}

const Details: React.FC<DetailsProps> = ({ formData, updateInputValue }) => {
  const textInputStyle = {
    border: "1px solid gray", // Gray border for text inputs
    padding: "5px",
    marginBottom: "10px",
  };
  useEffect(() => {
    // Log to verify the formData and updates
    console.log("formData in Details: ", formData);
  }, [formData]);
  return (
    <div>
      <label htmlFor="name" style={{ marginTop: "10px", fontSize: "18px" }}>
        Name
      </label>
      <Input
        id="name"
        placeholder="Enter the name of the app"
        required
        value={formData.name}
        style={textInputStyle}
        onChange={(e) => {
          updateInputValue("name", e.target.value);
        }}
      />

      <label
        htmlFor="description"
        style={{ marginTop: "10px", fontSize: "18px" }}
      >
        Description
      </label>
      <Textarea
        id="description"
        placeholder="Enter the description of the app"
        required
        value={formData.description}
        style={textInputStyle}
        onChange={(e) => {
          updateInputValue("description", e.target.value);
        }}
      />

      <label htmlFor="address" style={{ marginTop: "10px", fontSize: "18px" }}>
        Contract Address
      </label>
      <Input
        id="address"
        placeholder="Enter contract address"
        required
        value={formData.address}
        style={textInputStyle}
        onChange={(e) => {
          updateInputValue("address", e.target.value);
        }}
      />

      <label htmlFor="abi" style={{ marginTop: "10px", fontSize: "18px" }}>
        Enter contract ABI
      </label>
      <Textarea
        rows={4}
        id="abi"
        placeholder='[{"inputs":[], "name": "myFunction", "type":"function"}]'
        required
        value={formData.abi}
        style={textInputStyle}
        onChange={(e) => {
          updateInputValue("abi", e.target.value);
        }}
      />
    </div>
  );
};

export default Details;
