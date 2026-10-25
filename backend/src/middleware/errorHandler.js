function errorHandler(error, _req, res, _next) {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body must contain valid JSON." });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: Object.values(error.errors)
        .map((item) => item.message)
        .join(" "),
    });
  }

  if (error.name === "MongoServerError" && error.code === 11000) {
    return res.status(409).json({ message: "A task with that value already exists." });
  }

  console.error(error);
  return res.status(500).json({ message: "An unexpected server error occurred." });
}

module.exports = errorHandler;
