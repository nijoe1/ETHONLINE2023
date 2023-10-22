import { Blob, File, NFTStorage } from "nft.storage";

const endpoint = "https://api.nft.storage" as any;
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDAyYTBDMUE4NjVDYUQ2QjRkNThBMmQ3ZTczM2QxQmZlODExMGI1MTIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1Mzc2MzE0NjQ2NiwibmFtZSI6Im5mdHMifQ.muYCOBPi5WGkwgsQIxNe2GOSpgVxzZf_4Dv5jiEq9Dk" as string;

const storage = new NFTStorage({ endpoint, token });

export const uploadMetadata = async (json: any) => {
  const jsonString = JSON.stringify(json);

  // Create a Blob from the JSON string
  const blob = new Blob([jsonString], { type: "application/json" });
  const cid = await storage.storeBlob(blob);
  return cid;
};
