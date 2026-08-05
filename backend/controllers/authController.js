const AuthService = require('../services/AuthService');
const { ok, fail } = require('../utils/http');

exports.login = async (req, res) => {
  try {
    const output = await AuthService.login(req.body);
    return ok(res, output, 200);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return fail(res, error.message, statusCode);
  }
};

exports.register = async (req, res) => {
  try {
    const output = await AuthService.register(req.body);
    return ok(res, output, 201);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return fail(res, error.message, statusCode);
  }
};

// Compatibility alias kept for legacy route /api/signup
exports.signup = exports.register;