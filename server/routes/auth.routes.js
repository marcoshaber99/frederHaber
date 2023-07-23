const express = require('express');
const router = express.Router();
const { register, login, activate, setRole, roleSelection, getUserDetails } = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/verifyToken');
const { body } = require('express-validator'); // Add this line
const { check } = require('express-validator');


router.post('/register', [
  // email must be an email
  body('email').isEmail().withMessage('Must be a valid email'),
  // password must be at least 5 chars long
  body('password').isLength({ min: 5 }).withMessage('Must be at least 5 chars long')
], register);

router.post('/login', [
  // email must be an email
  body('email').isEmail().withMessage('Must be a valid email'),
  // password must be at least 5 chars long
  body('password').isLength({ min: 5 }).withMessage('Must be at least 5 chars long')
], login);

router.post('/activate', 
  check('token').notEmpty().withMessage('Token is required'),
  activate
);

router.post('/set-role', 
  [
    check('email').isEmail().withMessage('Must be a valid email'),
    check('role').isIn(['admin', 'manager']).withMessage('Invalid role')
  ],
  setRole
);

router.post('/role-selection', 
  [
    verifyToken,
    check('role').isIn(['admin', 'manager']).withMessage('Invalid role')
  ],
  roleSelection
);
router.get('/user-details', verifyToken, getUserDetails);
router.post('/verify-token', verifyToken, getUserDetails);

module.exports = router;
