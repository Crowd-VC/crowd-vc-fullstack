"use server";

import { PinataSDK } from "pinata";

const jwtToken = process.env.PINATA_JWT_TOKEN;
const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;

if (!jwtToken) {
  console.error("PINATA_JWT_TOKEN is not configured");
}

if (!gateway) {
  console.error("NEXT_PUBLIC_PINATA_GATEWAY is not configured");
}

const pinata = new PinataSDK({
  pinataJwt: jwtToken,
  pinataGateway: gateway,
});

export async function uploadPitch(formData: FormData) {
  try {
    // Validate configuration at runtime
    if (!jwtToken) {
      throw new Error("Pinata JWT token is not configured. Please check PINATA_JWT_TOKEN environment variable.");
    }
    if (!gateway) {
      throw new Error("Pinata gateway is not configured. Please check NEXT_PUBLIC_PINATA_GATEWAY environment variable.");
    }

    const file = formData.get("file") as File;
    const imageFile = formData.get("imageFile") as File | null;
    const metadataString = formData.get("metadata") as string;
    const metadata = JSON.parse(metadataString);

    if (!file) {
      throw new Error("No file provided");
    }

    // Upload file (Pitch Deck)
    const fileUpload = await pinata.upload.public.file(file);
    let imageCid: string | undefined;

    // Upload Image if provided
    if (imageFile) {
      const imageUpload = await pinata.upload.public.file(imageFile);
      imageCid = imageUpload.cid;
    }

    // Generate public gateway URL for the image if it exists
    let imageUrl: string | undefined;
    if (imageCid) {
      imageUrl = `https://${gateway}/ipfs/${imageCid}`;
    }

    // Add file CIDs to metadata
    const finalMetadata = {
      ...metadata,
      fileCid: fileUpload.cid,
      imageCid: imageCid,
      imageUrl: imageUrl,
    };

    // Upload metadata JSON
    const jsonUpload = await pinata.upload.public.json(finalMetadata);

    return {
      success: true,
      fileCid: fileUpload.cid,
      imageCid: imageCid,
      metadataCid: jsonUpload.cid,
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload to Pinata";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
