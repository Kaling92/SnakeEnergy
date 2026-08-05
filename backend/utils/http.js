function ok(res, payload, statusCode) {
  return res.status(statusCode || 200).json({
    success: true,
    ...payload
  });
}

function fail(res, message, statusCode, extra) {
  return res.status(statusCode || 500).json({
    success: false,
    message,
    ...(extra || {})
  });
}

module.exports = {
  ok,
  fail
};
