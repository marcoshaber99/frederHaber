const express = require('express');
const router = express.Router();
const { register, login, activate, setRole, roleSelection, getUserDetails } = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/verifyToken');

router.post('/register', register);
router.post('/login', login);
router.post('/activate', activate);
router.post('/set-role', setRole);
router.post('/role-selection', verifyToken, roleSelection);
router.get('/user-details', verifyToken, getUserDetails);
router.post('/verify-token', verifyToken, getUserDetails);




module.exports = router;
