const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword } = require('../controllers/passwordController');
const { check } = require('express-validator');

router.post('/forgot-password', 
  check('email').isEmail().withMessage('Must be a valid email'),
  forgotPassword
);

router.post('/reset-password', 
  [
    check('password').isLength({ min: 5 }).withMessage('Must be at least 5 chars long'),
    check('token').notEmpty().withMessage('Token is required')
  ],
  resetPassword
);

module.exports = router;
