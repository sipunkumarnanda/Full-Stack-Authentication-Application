import { resolveImageKitConfig } from "../src/services/imagekit.service.js";

describe("ImageKit configuration", () => {
  test("maps current ImageKit environment variables to the installed SDK", () => {
    expect(
      resolveImageKitConfig({
        IMAGEKIT_PUBLIC_KEY: " public-key ",
        IMAGEKIT_PRIVATE_KEY: " private-key ",
        IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/example_id/",
      })
    ).toEqual({
      imagekitId: "example_id",
      apiKey: "public-key",
      apiSecret: "private-key",
    });
  });

  test("supports the legacy SDK variable names directly", () => {
    expect(
      resolveImageKitConfig({
        IMAGEKIT_ID: "legacy-id",
        IMAGEKIT_API_KEY: "legacy-key",
        IMAGEKIT_API_SECRET: "legacy-secret",
      })
    ).toEqual({
      imagekitId: "legacy-id",
      apiKey: "legacy-key",
      apiSecret: "legacy-secret",
    });
  });
});
