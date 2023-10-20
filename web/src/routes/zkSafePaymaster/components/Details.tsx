import React, { useEffect, useState } from "react";
import { Input, Textarea } from "@material-tailwind/react";

interface DetailsProps {
  formData: any;
  updateName: (value: string) => void;
  updateDescription: (value: string) => void;
  updateAddress: (value: string) => void;
  updateAbi: (value: string) => void;
  textInputStyle: React.CSSProperties;
}

const Details: React.FC<DetailsProps> = ({
  formData,
  updateName,
  updateDescription,
  updateAddress,
  updateAbi,
  textInputStyle,
}) => {
  const [update, setUpdate] = useState(true);
  useEffect(() => {}, [update]);
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
          setUpdate(!update);
          updateName(e.target.value);
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
          setUpdate(!update);
          updateDescription(e.target.value);
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
          setUpdate(!update);
          updateAddress(e.target.value);
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
          setUpdate(!update);
          updateAbi(e.target.value);
        }}
      />
    </div>
  );
};

export default Details;
