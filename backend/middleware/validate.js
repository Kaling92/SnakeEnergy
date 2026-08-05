const { fail } = require('../utils/http');

function validateBody(validator) {
  return (req, res, next) => {
    const errors = validator(req.body || {});
    if (!errors.length) return next();
    return fail(res, 'Validation failed.', 400, { errors });
  };
}

function validateQuery(validator) {
  return (req, res, next) => {
    const errors = validator(req.query || {});
    if (!errors.length) return next();
    return fail(res, 'Validation failed.', 400, { errors });
  };
}

module.exports = {
  validateBody,
  validateQuery
};
