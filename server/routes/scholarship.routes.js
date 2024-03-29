const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); 

const { 
    createRequest,
    getRequests,
    getRequest,
    deleteRequest,
    updateRequest,
    getNewRequests,
    updateRequestStatus,
    getNewRequestsCount,
    getPendingApprovalsCount, 
    adminReview,
    getOpenRequestsCount,
    getOpenRequests,
    getLatestRequestStatus,
    getPendingApprovalRequests,
    getLatestPendingRequestStatus,
    approve,
    deny,
    getApprovedRequests,
    duplicateRequest, 
    generatePresignedUrl,
    managerDeleteRequest
} = require('../controllers/scholarship.controller');

const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');
const verifyManager = require('../middlewares/verifyManager');

router.post('/create-request', verifyToken, upload.single('file'), createRequest);
  
router.get('/get-requests', verifyToken, getRequests);
router.delete('/delete-request/:id', verifyToken, deleteRequest);
router.put('/update-request/:id', verifyToken, upload.single('file'), updateRequest);
router.get('/get-request/:id', verifyToken, getRequest);
router.get('/get-new-requests', verifyToken, getNewRequests);
router.patch('/update-request-status/:id', verifyToken, verifyAdmin, updateRequestStatus);
router.get('/get-new-requests-count', verifyToken, getNewRequestsCount);
router.get('/get-pending-approvals-count', verifyToken, verifyManager, getPendingApprovalsCount);
router.post('/admin-review', verifyToken, verifyAdmin, adminReview);
router.get('/get-open-requests-count', verifyToken, verifyAdmin, getOpenRequestsCount);
router.get('/get-open-requests', verifyToken, verifyAdmin, getOpenRequests);
router.get('/get-latest-request-status', verifyToken, getLatestRequestStatus);
router.get('/get-pending-approval', verifyToken, verifyManager, getPendingApprovalRequests);
router.get('/get-latest-pending-request-status', verifyToken, getLatestPendingRequestStatus);

router.post('/approve', verifyToken, verifyManager, approve);
router.post('/deny', verifyToken, verifyManager, deny);

router.get('/all-requests', verifyToken, getApprovedRequests);

router.post('/duplicate-request/:id', verifyToken, duplicateRequest);


router.get('/get-presigned-url/:key', verifyToken, generatePresignedUrl);

router.delete('/manager-delete-request/:id', verifyToken, verifyManager, managerDeleteRequest);



module.exports = router;
