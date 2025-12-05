"use server";

import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT_TOKEN,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
});

export async function uploadPitch(formData: FormData) {
  try {
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

    // Generate signed URL for the image if it exists
    let imageUrl: string | undefined;
    if (imageCid) {
      imageUrl = await pinata.gateways.createSignedURL({
        cid: imageCid,
        expires: 31536000, // 1 year in seconds
      });
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
    return {
      success: false,
      error: "Failed to upload to Pinata",
    };
  }
}
