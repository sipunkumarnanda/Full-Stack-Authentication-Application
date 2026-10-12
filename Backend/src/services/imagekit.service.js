import ImageKit, { toFile } from "@imagekit/nodejs";

let imagekit;

export function resolveImageKitConfig(env = process.env) {
  const privateKey = (
    env.IMAGEKIT_API_SECRET ||
    env.IMAGEKIT_PRIVATE_KEY ||
    env.IMAGEKITT_PRIVATE_KEY ||
    ""
  ).trim();
  return { privateKey };
}

function getImageKit() {
  if (!imagekit) {
    const config = resolveImageKitConfig();

    const missing = [];
    if (!config.privateKey) missing.push("IMAGEKIT_PRIVATE_KEY");
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

    const response = await getImageKit().files.upload({
      file: await toFile(file, fileName),
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
    await getImageKit().files.delete(fileId);
  } catch (error) {
    console.error("ImageKit delete failed:", error.message);
    throw error;
  }
}

export default uploadFile;
