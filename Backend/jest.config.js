

export default {
  testEnvironment: "node",

  testMatch: ["**/__tests__/**/*.test.js"],

  setupFiles: [
    "<rootDir>/__tests__/env.setup.js",
  ],

  setupFilesAfterEnv: [
    "<rootDir>/__tests__/setup.js",
  ],

  clearMocks: true,
};
