const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateBody } = require('../middleware/validate');
const { validateLoginBody, validateRegisterBody } = require('../validators/authValidators');

router.post('/register', validateBody(validateRegisterBody), authController.register);
router.post('/signup', validateBody(validateRegisterBody), authController.signup);
router.post('/login', validateBody(validateLoginBody), authController.login);

module.exports = router;