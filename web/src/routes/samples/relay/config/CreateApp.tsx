import {
  Button,
  FileInput,
  rem,
  Image,
  Select,
  Textarea,
  TextInput,
  Title,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useState } from "react";
import { ethers } from "ethers";
import { parseAbiToFunction } from "../../../../lib/abiParse";
import { IconChevronDown, IconUpload } from "@tabler/icons-react";
import { uploadImage } from "../../../../lib/uploadImage";
import { showNotification } from "@mantine/notifications";

export const selectStyle = (theme: any) => ({
  input: {
    backgroundColor: theme.colors.blueTheme[3],
    borderRadius: "0.5rem",
    color: theme.colors.blueTheme[5],
    borderColor: theme.colors.blueTheme[3],
    "&:focus": {
      borderColor: "#3304ba",
    },
    "&::placeholder": {
      color: theme.colors.blueTheme[5],
    },
  },
  label: {
    color: theme.colors.blueTheme[4],
  },
  dropdown: {
    backgroundColor: theme.colors.blueTheme[3],
    border: "none",
  },
  item: {
    color: theme.colors.blueTheme[5],
    backgroundColor: theme.colors.blueTheme[4],
    "&[data-selected]": {
      "&, &:hover": {
        backgroundColor: theme.colors.blueTheme[0],
      },
    },

    "&[data-hovered]": {
      backgroundColor: theme.colors.blueTheme[2],
    },
  },
});

export const style = (theme: any) => ({
  input: {
    backgroundColor: theme.colors.blueTheme[3],
    borderRadius: "0.5rem",
    color: theme.colors.blueTheme[5],
    borderColor: theme.colors.blueTheme[3],
    "&:focus": {
      borderColor: "#3304ba",
    },
    "&::placeholder": {
      color: theme.colors.blueTheme[5],
    },
  },
  label: {
    color: theme.colors.blueTheme[4],
  },
});

export default function CreateApp() {
  const [selectedFunctionComponent, setSelectedFunctionComponent] =
    useState<any>(null);
  const [selectData, setSelectData] = useState<any[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  let abiFunctions: any[] = [];

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      website: "",
      abi: "",
      functionName: "",
      id: "",
      chainId: "",
    },
    validate: {
      // id: (value) => ethers.utils.isAddress(value!) ? undefined : "Invalid address",
      abi: (value) => (validateAbiInput(value) ? undefined : "Invalid ABI"),
      functionName: (value) =>
        handleSelectChange(value) ? undefined : "Select a function",
    },
    validateInputOnChange: true,
  });

  const handleSubmit = async (values: any) => {
    if (!image) {
      showNotification({
        title: "Error",
        message: "Please upload an image",
        autoClose: false,
        color: "red",
      });
      return;
    }
    setLoading(true);
    try {
      const imageCid = await uploadImage(image!);
      const { functionAbi } = parseAbiToFunction(values.abi);
      // const response = await createApp({
      //     name: values.name,
      //     description: values.description,
      //     creator: values.creator,
      //     website: values.website,
      //     abi: JSON.stringify(functionAbi),
      //     chainId: values.chainId,
      //     id: values.id,
      //     imageCid: imageCid,
      // })
      // console.log(response)
      showNotification({
        title: "Success",
        message: "App created successfully",
        autoClose: true,
      });
      form.reset();
      setImage(null);
    } catch (e: any) {
      console.log(e);
      showNotification({
        title: "Error",
        message: e.message,
        autoClose: false,
        color: "red",
      });
    }
    setLoading(false);
  };

  const validateAbiInput = (abi: string) => {
    try {
      const parsedAbi = parseAbiToFunction(abi).filteredAbi;
      // console.log(parsedAbi);
      abiFunctions = parsedAbi;
      const selectData_ = parsedAbi.map((abiFunction: any, index: number) => {
        return {
          label: `${abiFunction.name}(${abiFunction.inputs
            .map((input: any) => input.type)
            .join(", ")})`,
          value: index,
        };
      });
      // console.log(selectData_)
      setSelectData(selectData_);
      return true;
    } catch (e) {
      setSelectData([]);
      setSelectedFunctionComponent(null);
      return false;
    }
  };

  const handleSelectChange = (value: any) => {
    if (value === undefined) return false;
    const func = abiFunctions[value];
    const functionComponent = func?.inputs?.map((input: any, index: number) => {
      return (
        <TextInput
          key={index}
          my="sm"
          placeholder={input.type}
          required
          label={`${input.name} (${input.type})`}
          readOnly
          styles={(theme) => style(theme)}
        />
      );
    });
    setSelectedFunctionComponent(functionComponent);
    return true;
  };

  return (
    <div>
       {/* @ts-ignore */}
      <Title color="#AE3EC9">Create App</Title>
      <Center>
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <TextInput
            my="sm"
            placeholder="Enter the name of the app"
            required
            label="App Name"
            {...form.getInputProps("name")}
            styles={(theme) => style(theme)}
          />
          <TextInput
            my="sm"
            placeholder="Enter the description of the app"
            required
            label="App Description"
            {...form.getInputProps("description")}
            styles={(theme) => style(theme)}
          />
          <TextInput
            my="sm"
            placeholder="Enter the website url of the app"
            required
            label="App Website URL"
            {...form.getInputProps("website")}
            styles={(theme) => style(theme)}
          />
          <TextInput
            my="sm"
            placeholder="Enter the contract address"
            required
            label="Enter the contract address you want to interact with"
            {...form.getInputProps("id")}
            styles={(theme) => style(theme)}
          />
          <Select
            data={[
              { label: "Gnosis", value: "0x64" },
              { label: "Goerli", value: "0x5" },
              { label: "Polygon", value: "0x89" },
              { label: "Optimism", value: "0xa" },
            ]}
            rightSection={<IconChevronDown color="#fff" size="1rem" />}
            my="sm"
            placeholder="Enter the chain ID"
            required
            label="Contract Chain ID"
            {...form.getInputProps("chainId")}
            styles={(theme) => selectStyle(theme)}
          />
          <FileInput
            my="sm"
            placeholder="Upload the image"
            required
            label="Upload the image"
            accept="image/*"
            // @ts-ignore
            icon={<IconUpload color="#fff" size={rem(14)} />}
            onChange={setImage}
            styles={(theme) => ({
              ...style(theme),
              placeholder: {
                color: `${theme.colors.blueTheme[5]} !important`,
              },
            })}
          />
          {image && (
            <Center>
              <Image
                src={URL.createObjectURL(image)}
                width={450}
                alt="App Image"
              />
            </Center>
          )}
          <Textarea
            minRows={4}
            maxRows={9}
            my="sm"
            placeholder='[{"inputs":[], "name": "myFunction", "type":"function"}]'
            required
            label='Enter your ABI json  [{"inputs":[], "name": "myFunction", "type":"function"}]'
            {...form.getInputProps("abi")}
            styles={(theme) => style(theme)}
          />
          <Select
            data={selectData}
            rightSection={<IconChevronDown color="#fff" size="1rem" />}
            placeholder="Select a function"
            searchable
            label="Select a function"
            {...form.getInputProps("functionName")}
            styles={(theme) => selectStyle(theme)}
          />
          {selectedFunctionComponent}
          {selectedFunctionComponent && (
            <TextInput
              my="sm"
              placeholder="Enter the value"
              required
              label="Enter the amount you want to send (Leave 0 if no amount has to be sent)"
              readOnly
              styles={(theme) => style(theme)}
            />
          )}
          <Button
            loading={loading}
            fullWidth
            type="submit"
            color="red"
            mt="md"
            styles={(theme) => ({
              root: {
                backgroundColor: theme.colors.violet[6],
                "&:hover": {
                  backgroundColor: `${theme.colors.violet[4]} !important`,
                  color: `${theme.colors.blueTheme[1]} !important`,
                },
              },
            })}
          >
            Create App
          </Button>
        </form>
      </Center>
    </div>
  );
}
