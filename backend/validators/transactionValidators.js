const VALID_TOKENS = new Set(['BTC', 'ETH', 'BNB', 'SOL']);

function validateSendBody(body) {
  const errors = [];
  if (!body.receiverAddress || !/^0x[a-fA-F0-9]{16,}$/.test(String(body.receiverAddress))) {
    errors.push('receiverAddress must be a valid hexadecimal wallet address (0x...).');
  }
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push('amount must be a number greater than 0.');
  }
  const token = String(body.tokenSymbol || '').toUpperCase();
  if (!VALID_TOKENS.has(token)) {
    errors.push('tokenSymbol must be one of BTC, ETH, BNB, SOL.');
  }
  if (body.feeAmount != null) {
    const fee = Number(body.feeAmount);
    if (!Number.isFinite(fee) || fee < 0) {
      errors.push('feeAmount must be a non-negative number when provided.');
    }
  }
  return errors;
}

function validateSwapBody(body) {
  const errors = [];
  const from = String(body.fromToken || '').toUpperCase();
  const to = String(body.toToken || '').toUpperCase();
  if (!VALID_TOKENS.has(from)) {
    errors.push('fromToken must be one of BTC, ETH, BNB, SOL.');
  }
  if (!VALID_TOKENS.has(to)) {
    errors.push('toToken must be one of BTC, ETH, BNB, SOL.');
  }
  if (from && to && from === to) {
    errors.push('fromToken and toToken must be different.');
  }
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push('amount must be a number greater than 0.');
  }
  return errors;
}

function validateTransactionsQuery(query) {
  const errors = [];
  if (query.page != null) {
    const page = Number(query.page);
    if (!Number.isInteger(page) || page < 1) {
      errors.push('page must be an integer >= 1.');
    }
  }
  if (query.limit != null) {
    const limit = Number(query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      errors.push('limit must be an integer between 1 and 100.');
    }
  }
  return errors;
}

function validateSwapQuoteQuery(query) {
  const errors = [];
  const from = String(query.fromToken || '').toUpperCase();
  const to = String(query.toToken || '').toUpperCase();
  if (!VALID_TOKENS.has(from) && !['SNAKE', 'USDC'].includes(from)) {
    errors.push('fromToken is required.');
  }
  if (!VALID_TOKENS.has(to) && !['SNAKE', 'USDC'].includes(to)) {
    errors.push('toToken is required.');
  }
  const amount = Number(query.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push('amount must be a number greater than 0.');
  }
  return errors;
}

module.exports = {
  validateSendBody,
  validateSwapBody,
  validateTransactionsQuery,
  validateSwapQuoteQuery
};
