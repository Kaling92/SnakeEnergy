function buildLog(level, message, meta) {
  const timestamp = new Date().toISOString();
  if (meta) {
    return `[${timestamp}] [${level}] ${message} ${JSON.stringify(meta)}`;
  }
  return `[${timestamp}] [${level}] ${message}`;
}

function info(message, meta) {
  console.log(buildLog('INFO', message, meta));
}

function warn(message, meta) {
  console.warn(buildLog('WARN', message, meta));
}

function error(message, meta) {
  console.error(buildLog('ERROR', message, meta));
}

module.exports = {
  info,
  warn,
  error
};
