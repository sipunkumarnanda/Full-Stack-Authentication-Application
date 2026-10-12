

import Redis from "ioredis";

class FakeRedis {
  constructor() {
    this.store = new Map();
    this.expires = new Map();
  }

  async set(key, value, ...args) {
    const exIndex = args.findIndex(
      (arg) => String(arg).toUpperCase() === "EX"
    );

    if (exIndex !== -1 && args[exIndex + 1] != null) {
      const seconds = Number(args[exIndex + 1]);

      if (!Number.isFinite(seconds) || seconds <= 0) {
        throw new Error("Invalid expiry time");
      }

      this.expires.set(key, Date.now() + seconds * 1000);
    } else {
      this.expires.delete(key);
    }

    this.store.set(key, value);
    return "OK";
  }

  async get(key) {
    const expiry = this.expires.get(key);

    if (expiry !== undefined && Date.now() >= expiry) {
      this.store.delete(key);
      this.expires.delete(key);
      return null;
    }

    return this.store.has(key) ? this.store.get(key) : null;
  }

  async del(...keys) {
    let deleted = 0;

    for (const key of keys) {
      await this.get(key);

      if (this.store.delete(key)) {
        deleted++;
      }

      this.expires.delete(key);
    }

    return deleted;
  }

  async ttl(key) {
    await this.get(key);

    if (!this.store.has(key)) {
      return -2;
    }

    const expiry = this.expires.get(key);

    if (expiry === undefined) {
      return -1;
    }

    return Math.max(
      0,
      Math.ceil((expiry - Date.now()) / 1000)
    );
  }

  on() {
    return this;
  }

  async quit() {
    return "OK";
  }
}

let redis;

if (process.env.NODE_ENV === "test") {
  redis = new FakeRedis();
} else {
  const host = process.env.REDIS_HOST?.trim();
  const portValue = process.env.REDIS_PORT;
  const port = Number(portValue);
  const password = process.env.REDIS_PASSWORD;
  const username = process.env.REDIS_USERNAME?.trim() || "default";
  const useTLS = process.env.REDIS_TLS === "true";

  if (!host || !portValue || !password) {
    throw new Error(
      "Missing REDIS_HOST, REDIS_PORT, or REDIS_PASSWORD in .env"
    );
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("REDIS_PORT must be a valid port number");
  }

  const redisOptions = {
    host,
    port,
    username,
    password,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
  };

  if (useTLS) {
    redisOptions.tls = {};
  }

  redis = new Redis(redisOptions);

  redis.on("connect", () => {
    console.log("Redis TCP/TLS connection established");
  });

  redis.on("ready", () => {
    console.log("Redis is ready to accept commands");
  });

  redis.on("error", (error) => {
    console.error("Redis connection error:", error.message);
  });
}

export async function connectRedis() {
  if (process.env.NODE_ENV === "test") {
    console.log("Using FakeRedis for tests");
    return;
  }

  if (redis.status === "wait") {
    await redis.connect();
  }

  if (redis.status !== "ready") {
    throw new Error(
      `Redis is not ready. Current status: ${redis.status}`
    );
  }
}

export default redis;
