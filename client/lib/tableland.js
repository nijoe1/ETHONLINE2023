import axios from "axios";
import { tables } from "@/lib/utils";

const TablelandGateway =
  "https://testnets.tableland.network/api/v1/query?statement=";

export const getPaymasters = async (chainId) => {
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT
         *
      FROM
          ${tables[chainId].Paymasters}`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    console.log(result)
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getData = async(cid)=>{
  const query = "https://nftstorage.link/ipfs/"+cid
  const result = await axios.get(query);
  console.log(result.data)
  return result.data;
}

export const getPaymaster = async (chainId, address) => {
  const getAllSchemasQuery =
    TablelandGateway +
    `SELECT
         *
      FROM
          ${tables[chainId].Paymasters}
      WHERE
          ${
            tables[chainId].Paymasters
          }.PaymasterAddress = '${address.toLowerCase()}'`;

  try {
    const result = await axios.get(getAllSchemasQuery);
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

