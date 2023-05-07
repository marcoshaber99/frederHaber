const express = require('express');
const router = express.Router();
const { createRequest, getRequests, deleteRequest } = require('../controllers/scholarship.controller');
const verifyToken = require('../middlewares/verifyToken');

router.post('/create-request', verifyToken, createRequest);
router.get('/get-requests', verifyToken, getRequests);
router.delete('/delete-request/:id', verifyToken, deleteRequest);


module.exports = router;
