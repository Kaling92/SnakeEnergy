const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { fail } = require('../utils/http');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return fail(res, 'Access denied. No token provided.', 401);
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded; // Attaches { userId: "..." } to the request object
    next();
  } catch (error) {
    return fail(res, 'Invalid or expired token.', 401);
  }
};