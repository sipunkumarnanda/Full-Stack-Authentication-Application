import ImageKit from "imagekit";

let imagekit;

function getImageKit() {
  if (!imagekit) {
    const publicKey = (process.env.IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKITT_PUBLIC_KEY || "").trim();
    const privateKey = (process.env.IMAGEKIT_PRIVATE_KEY || process.env.IMAGEKITT_PRIVATE_KEY || "").trim();
    const urlEndpoint = (process.env.IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKITT_URL_ENDPOINT || "").trim();

    const missing = [];
    if (!publicKey) missing.push("IMAGEKIT_PUBLIC_KEY");
    if (!privateKey) missing.push("IMAGEKIT_PRIVATE_KEY");
    if (!urlEndpoint) missing.push("IMAGEKIT_URL_ENDPOINT");
    if (missing.length) {
      const error = new Error(`Missing ImageKit configuration: ${missing.join(", ")}`);
      error.statusCode = 503;
      throw error;
    }

    imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  }
  return imagekit;
}

async function uploadFile(file, fileName) {
  try {
    if (!file || !Buffer.isBuffer(file)) {
      const error = new Error("A valid image buffer is required");
      error.statusCode = 400;
      throw error;
    }

    const response = await getImageKit().upload({
      file,
      fileName,
      folder: "/caption_generator",
    });
    return response;
  } catch (error) {
    console.error("ImageKit upload failed:", error.message);
    throw error;
  }
}

export async function deleteImage(fileId) {
  if (!fileId) return;
  try {
    await getImageKit().deleteFile(fileId);
  } catch (error) {
    console.error("ImageKit delete failed:", error.message);
    throw error;
  }
}

export default uploadFile;
