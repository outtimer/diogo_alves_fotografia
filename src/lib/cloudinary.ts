import { v2 as cloudinary } from 'cloudinary';

// Lazy initialization to avoid crashes if environment variables are missing
let isConfigured = false;

export function getCloudinary() {
  if (!isConfigured) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn('Cloudinary environment variables are missing. Image uploads will not work.');
      return null;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    
    isConfigured = true;
  }
  return cloudinary;
}
