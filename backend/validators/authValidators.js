function validateLoginBody(body) {
  const errors = [];
  if (!body.username || String(body.username).trim().length < 3) {
    errors.push('username is required and must be at least 3 characters.');
  }
  if (!body.password || String(body.password).length < 6) {
    errors.push('password is required and must be at least 6 characters.');
  }
  return errors;
}

function validateRegisterBody(body) {
  const errors = validateLoginBody(body);
  if (body.fullName && String(body.fullName).trim().length < 2) {
    errors.push('fullName must be at least 2 characters if provided.');
  }
  return errors;
}

module.exports = {
  validateLoginBody,
  validateRegisterBody
};
