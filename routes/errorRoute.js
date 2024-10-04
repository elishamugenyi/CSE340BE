// errorRoute.js
const express = require('express');
const router = express.Router();

// Route to intentionally trigger an error
router.get('/trigger-error', (req, res, next) => {
  const error = new Error('This is an intentional server error.');
  error.status = 500;
  next(error); // Pass the error to the error handler
});

module.exports = router;
