const errorHandler = (err, req, res, next) => {
  // Client cancelled upload / closed socket — nothing useful to return
  if (
    err?.message === "Request aborted" ||
    err?.code === "ECONNABORTED" ||
    req.aborted
  ) {
    if (!res.headersSent) {
      res.status(499).end();
    }
    return;
  }

  console.error(err);

  if (res.headersSent) return next(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;