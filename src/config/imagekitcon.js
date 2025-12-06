import ImageKit from 'imagekit';

let imagekit;

function getImageKitInstance() {
  if (imagekit) return imagekit;

  try {
    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
    return imagekit;
  } catch (err) {
    console.error("Unable to initialize ImageKit:", err.message);
    return null;
  }
}

export function getPresignedUploadUrl(expireInSeconds = 60, folder = 'k-hive') {
  const imagekitInstance = getImageKitInstance();
  
  if (!imagekitInstance) {
    console.log("Imagekit Instance not Initialized");
    throw new Error("ImageKit not initialized");
  }

  const authParams = imagekitInstance.getAuthenticationParameters({
    expire: expireInSeconds
  });

  return {
    token: authParams.token,
    expire: authParams.expire,
    signature: authParams.signature,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    uploadUrl: `${process.env.IMAGEKIT_URL_ENDPOINT}/api/v1/files/upload`,
    folder: folder
  };
}

export async function deleteFileByUrl(fileUrl) {
  const imagekitInstance = getImageKitInstance();
  
  if (!imagekitInstance) {
    console.log("Imagekit Instance not Initialized");
    return false;
  }

  try {
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
    
    if (!fileUrl.startsWith(urlEndpoint)) {
      throw new Error("Invalid ImageKit URL");
    }

    // Get the file path after the endpoint
    const filePath = fileUrl.replace(urlEndpoint, '').split('?')[0];
    
    // List files to find the fileId by filePath
    const files = await imagekitInstance.listFiles({
      path: filePath,
      limit: 1
    });

    if (!files || files.length === 0) {
      throw new Error("File not found");
    }

    const fileId = files[0].fileId;

    // Delete the file
    const result = await imagekitInstance.deleteFile(fileId);
    
    return true;
  } catch (err) {
    console.error("Error deleting file:", err.message);
    return false;
  }
}