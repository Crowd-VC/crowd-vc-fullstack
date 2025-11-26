'use server';

import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

export async function uploadPitch(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const metadataString = formData.get("metadata") as string;
    const metadata = JSON.parse(metadataString);

    if (!file) {
      throw new Error("No file provided");
    }

    // Upload file
    const fileUpload = await pinata.upload.public.file(file);

    // Add file CID to metadata
    const finalMetadata = {
      ...metadata,
      fileCid: fileUpload.cid,
    };

    // Upload metadata JSON
    const jsonUpload = await pinata.upload.public.json(finalMetadata);

    return {
      success: true,
      fileCid: fileUpload.cid,
      metadataCid: jsonUpload.cid,
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    return {
      success: false,
      error: "Failed to upload to Pinata",
    };
  }
}
