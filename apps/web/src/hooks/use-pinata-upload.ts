import { useState } from 'react';
import { uploadPitch } from '@/app/actions/pinata';

interface UploadResult {
  success: boolean;
  fileCid?: string;
  imageCid?: string;
  metadataCid?: string;
  error?: string;
}

export function usePinataUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UploadResult | null>(null);

  const uploadToPinata = async (file: File, metadata: any, imageFile?: File) => {
    setIsUploading(true);
    setError(null);
    setData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (imageFile) {
        formData.append('imageFile', imageFile);
      }
      formData.append('metadata', JSON.stringify(metadata));

      const result = await uploadPitch(formData);

      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Upload failed');
      }
      return result;
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    error,
    data,
    uploadToPinata,
  };
}
