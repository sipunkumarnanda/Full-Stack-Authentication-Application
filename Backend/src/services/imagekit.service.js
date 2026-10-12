import ImageKit from "imagekit";

let imagekit;

function imageKitIdFromEndpoint(endpoint) {
  if (!endpoint) return "";

  try {
    const url = new URL(
      endpoint.startsWith("http") ? endpoint : `https://${endpoint}`
    );
    return url.pathname.split("/").filter(Boolean)[0] || "";
  } catch {
    return "";
  }
}

export function resolveImageKitConfig(env = process.env) {
  const publicKey = (
    env.IMAGEKIT_API_KEY ||
    env.IMAGEKIT_PUBLIC_KEY ||
    env.IMAGEKITT_PUBLIC_KEY ||
    ""
  ).trim();
  const privateKey = (
    env.IMAGEKIT_API_SECRET ||
    env.IMAGEKIT_PRIVATE_KEY ||
    env.IMAGEKITT_PRIVATE_KEY ||
    ""
  ).trim();
  const urlEndpoint = (
    env.IMAGEKIT_URL_ENDPOINT ||
    env.IMAGEKITT_URL_ENDPOINT ||
    ""
  ).trim();
  const imagekitId = (
    env.IMAGEKIT_ID || imageKitIdFromEndpoint(urlEndpoint)
  ).trim();

  return {
    imagekitId,
    apiKey: publicKey,
    apiSecret: privateKey,
  };
}

function getImageKit() {
  if (!imagekit) {
    const config = resolveImageKitConfig();

    const missing = [];
    if (!config.imagekitId) missing.push("IMAGEKIT_ID or IMAGEKIT_URL_ENDPOINT");
    if (!config.apiKey) missing.push("IMAGEKIT_PUBLIC_KEY");
    if (!config.apiSecret) missing.push("IMAGEKIT_PRIVATE_KEY");
    if (missing.length) {
      const error = new Error(`Missing ImageKit configuration: ${missing.join(", ")}`);
      error.statusCode = 503;
      throw error;
    }

    imagekit = new ImageKit(config);
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

    const response = await getImageKit().upload(file, {
      filename: fileName,
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
