const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateSendBody,
  validateSwapBody,
  validateTransactionsQuery,
  validateSwapQuoteQuery
} = require('../validators/transactionValidators');

const {
  validateLoginBody,
  validateRegisterBody
} = require('../validators/authValidators');

test('validateLoginBody accepts valid payload', () => {
  const errors = validateLoginBody({ username: 'alice@example.com', password: 'secret123' });
  assert.equal(errors.length, 0);
});

test('validateLoginBody rejects short password', () => {
  const errors = validateLoginBody({ username: 'alice', password: '123' });
  assert.ok(errors.some((e) => e.includes('password')));
});

test('validateRegisterBody rejects short fullname', () => {
  const errors = validateRegisterBody({ username: 'alice@example.com', password: 'secret123', fullName: 'A' });
  assert.ok(errors.some((e) => e.includes('fullName')));
});

test('validateSendBody accepts valid send payload', () => {
  const errors = validateSendBody({
    receiverAddress: '0x1234abcd5678ef901234abcd5678ef90abcd1234',
    amount: 1.25,
    tokenSymbol: 'ETH',
    feeAmount: 0.0001
  });
  assert.equal(errors.length, 0);
});

test('validateSendBody rejects invalid token/address', () => {
  const errors = validateSendBody({ receiverAddress: 'abc', amount: -1, tokenSymbol: 'DOGE' });
  assert.ok(errors.length >= 2);
});

test('validateSwapBody enforces token rules', () => {
  const errors = validateSwapBody({ fromToken: 'ETH', toToken: 'ETH', amount: 1 });
  assert.ok(errors.some((e) => e.includes('different')));
});

test('validateTransactionsQuery enforces page/limit bounds', () => {
  const errors = validateTransactionsQuery({ page: 0, limit: 1000 });
  assert.ok(errors.length >= 2);
});

test('validateSwapQuoteQuery enforces positive amount', () => {
  const errors = validateSwapQuoteQuery({ fromToken: 'ETH', toToken: 'BTC', amount: 0 });
  assert.ok(errors.some((e) => e.includes('greater than 0')));
});
