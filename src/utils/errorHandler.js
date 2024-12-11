const sendErrorProd = (err, req, res) => {
  console.error("ERROR 💥", err);

  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      console.log("reached here");
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
  }

  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const errorHandler = (err, req, res, next) => {
  console.log("error stack");
  console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  error.message = err.message;

  sendErrorProd(error, req, res);
};

module.exports = { errorHandler };
