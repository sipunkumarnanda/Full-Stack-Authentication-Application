import { jest } from "@jest/globals";

import errorMiddleware from "../src/middlewares/error.middleware.js";

describe("Error middleware", () => {
  test("does not pass a symbolic third-party status code to Express", () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const response = { headersSent: false, status, json };

    errorMiddleware(
      { statusCode: "SERVER_ERROR", message: "Upload failed" },
      {},
      response,
      jest.fn()
    );

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});
