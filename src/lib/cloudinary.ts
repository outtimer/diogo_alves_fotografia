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

export async function deleteFromCloudinary(url: string): Promise<boolean> {
  if (!url) return false;
  
  const cloudinary = getCloudinary();
  if (!cloudinary) {
    console.warn('Cloudinary not configured. Cannot delete image.');
    return false;
  }

  try {
    if (!url.includes("cloudinary.com")) {
      console.log("Not a Cloudinary URL, skipping deletion from cloud:", url);
      return false;
    }

    const parts = url.split("/upload/");
    if (parts.length < 2) return false;
    
    const pathParts = parts[1].split("/");
    // If the first part starts with 'v' and is followed by numbers (a version string), remove it
    if (pathParts[0].startsWith("v") && /^\d+$/.test(pathParts[0].substring(1))) {
      pathParts.shift();
    }
    
    const filenameWithExt = pathParts.join("/");
    // Remove the file extension
    const dotIndex = filenameWithExt.lastIndexOf(".");
    const publicId = dotIndex !== -1 ? filenameWithExt.substring(0, dotIndex) : filenameWithExt;

    console.log(`Deleting image from Cloudinary. Public ID: ${publicId}`);
    
    return new Promise<boolean>((resolve) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Error deleting from Cloudinary:", error);
          resolve(false);
        } else {
          console.log("Cloudinary deletion result:", result);
          resolve(result?.result === "ok");
        }
      });
    });
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error);
    return false;
  }
}

