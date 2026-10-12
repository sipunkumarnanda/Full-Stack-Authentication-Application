

const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  // Third-party SDKs sometimes expose symbolic status codes (for example,
  // "SERVER_ERROR"). Express only accepts integer HTTP status codes.
  const candidates = [err.statusCode, err.status];
  const statusCode =
    candidates.find(
      (value) => Number.isInteger(value) && value >= 400 && value <= 599
    ) || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message,
  });
};

export default errorMiddleware;
