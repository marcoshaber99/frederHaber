const express = require('express');
const router = express.Router();
const fileUpload = require('../cloudinary.config');
const axios = require('axios');

const { 
    createRequest,
    getRequests,
    getRequest,
    deleteRequest,
    updateRequest,
    getNewRequests,
    updateRequestStatus,
    getNewRequestsCount,
    adminReview,
    getOpenRequestsCount,
    getOpenRequests,
    getLatestRequestStatus,
    getPendingApprovalRequests,
    getLatestPendingRequestStatus,
    approve,
    deny,
    getApprovedRequests,
    duplicateRequest
} = require('../controllers/scholarship.controller');


const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');
const verifyManager = require('../middlewares/verifyManager');


router.post('/create-request', verifyToken, createRequest);

router.post('/upload', verifyToken, fileUpload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    let fileUrl = req.file.path;
    
    // If the uploaded file is a PDF, change the URL to fetch it as an image
    if (fileUrl.endsWith('.pdf')) {
      fileUrl = fileUrl.replace('.pdf', '.png');
    }
  
    res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl: fileUrl,
      fileName: req.file.originalname, // Send the original filename to the client

    });
  });
  
  
router.get('/get-requests', verifyToken, getRequests);
router.delete('/delete-request/:id', verifyToken, deleteRequest);
router.put('/update-request/:id', verifyToken, updateRequest);
router.get('/get-request/:id', verifyToken, getRequest);
router.get('/get-new-requests', verifyToken, getNewRequests);
router.patch('/update-request-status/:id', verifyToken, verifyAdmin, updateRequestStatus);
router.get('/get-new-requests-count', verifyToken, getNewRequestsCount);
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


router.get('/file', verifyToken, async (req, res) => {
    try {
      const fileUrl = req.query.url;
      
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer', // This is important. It specifies that you want to receive the response as a Buffer
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.CLOUDINARY_KEY}:${process.env.CLOUDINARY_SECRET}`).toString('base64')}`, 
          // The API key and secret are base64 encoded and added to the Authorization header
        },
      });
      
      res.set({
        'Content-Type': response.headers['content-type'],
        'Content-Length': response.headers['content-length'],
        'Content-Disposition': 'inline', // This specifies that you want to display the file in the browser rather than downloading it
      });
      
      res.send(response.data);
    } catch (err) {
      console.error('Error fetching file: ', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  


module.exports = router;
