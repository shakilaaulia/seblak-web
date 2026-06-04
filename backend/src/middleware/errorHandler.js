// src/middleware/errorHandler.js
function errorHandler(err, req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
