const express = require('express');
const router = express.Router();

const { 
    createRequest,
    getRequests,
    getRequest,
    deleteRequest,
    updateRequest,
    getNewRequests,
} = require('../controllers/scholarship.controller');



const verifyToken = require('../middlewares/verifyToken');

router.post('/create-request', verifyToken, createRequest);
router.get('/get-requests', verifyToken, getRequests);
router.delete('/delete-request/:id', verifyToken, deleteRequest);
router.put('/update-request/:id', verifyToken, updateRequest);
router.get('/get-requests/:id', verifyToken, getRequest);
router.get('/get-new-requests', verifyToken, getNewRequests);


module.exports = router;
