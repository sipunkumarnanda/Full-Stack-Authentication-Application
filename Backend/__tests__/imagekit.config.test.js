import { resolveImageKitConfig } from "../src/services/imagekit.service.js";

describe("ImageKit configuration", () => {
  test("maps the private key to the supported ImageKit SDK", () => {
    expect(
      resolveImageKitConfig({
        IMAGEKIT_PRIVATE_KEY: " private-key ",
      })
    ).toEqual({
      privateKey: "private-key",
    });
  });

  test("supports the API secret aliases", () => {
    expect(
      resolveImageKitConfig({
        IMAGEKIT_API_SECRET: "legacy-secret",
      })
    ).toEqual({
      privateKey: "legacy-secret",
    });
  });
});
