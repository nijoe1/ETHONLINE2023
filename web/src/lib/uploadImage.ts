import {Blob, File, NFTStorage} from "nft.storage"

const endpoint = "https://api.nft.storage" as any
const token = process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY as string

const storage = new NFTStorage({endpoint, token})

export const uploadImage = async (file: File) => {
    const blob = new Blob([file], {type: "image/*"})
    return await storage.storeBlob(blob)
}