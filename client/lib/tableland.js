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
    return result.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

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

