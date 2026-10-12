import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const envPath = fileURLToPath(new URL("./.env", import.meta.url));
const envResult = dotenv.config({ path: envPath, quiet: true });

// A local .env file is convenient in development, but production hosts such as
// Render inject variables directly into process.env and do not create this file.
if (envResult.error && envResult.error.code !== "ENOENT") {
  console.error(`Failed to load environment file at ${envPath}:`, envResult.error.message);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Import modules only after .env has been loaded. Some database modules
    // validate their environment variables during module initialization.
    const [
      { default: app },
      { default: connectDB },
      { connectRedis },
    ] = await Promise.all([
      import("./src/app.js"),
      import("./src/db/db.js"),
      import("./src/db/redis.js"),
    ]);

    await connectDB();
    console.log("MongoDB connected successfully");

    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Auth Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Auth Service:", error.message);
    process.exit(1);
  }
}

startServer();
