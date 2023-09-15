const db = require('../config/db.config');
const sgMail = require('@sendgrid/mail');
const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const path = require('path');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { validateRequest } = require('./validateRequest');
const { validateAdminRequest } = require('./validateAdminRequest');

const s3 = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.createRequest = async (req, res) => {
  try {
    const errors = validateRequest(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation error', errors });
    }

    let { 
      first_name, 
      last_name, 
      sport, 
      description, 
      government_id, 
      registration_number, 
      phone_number, 
      course_title, 
      year_of_admission, 
      education_level, 
      city, 
      status 
    } = req.body;

    const user_id = req.user.id;

    // Get the file from the request
    const file = req.file;
    let file_url = null;
    let file_key = null; // Initialize the file key
    if (file) {
      const Key = Date.now().toString() + path.extname(file.originalname); // Add the file extension to the Key
      const params = {
        Bucket: `${process.env.AWS_BUCKET_NAME}`,
        Key,
        Body: file.buffer
      };
      await s3.send(new PutObjectCommand(params));
      // Construct the file URL
      file_url = `https://${params.Bucket}.s3.eu-north-1.amazonaws.com/${Key}`;
      file_key = Key; // Save the key for database storage
    }

    const [existingRequests] = await db.query('SELECT * FROM scholarship_requests WHERE user_id = ? AND (status = ? OR status = ?)', [user_id, 'submitted', 'requires_more_info']);

    if (existingRequests.length > 0) {
      return res.status(400).json({ message: 'You already have a request that is waiting for approval. Please wait until it is processed.' });
    }

    // If registration_number is not provided or is an empty string, set it to null
    if (!registration_number) {
      registration_number = null;
    }

    await db.query(
      'INSERT INTO scholarship_requests (user_id, first_name, last_name, sport, description, government_id, registration_number, phone_number, course_title, year_of_admission, education_level, city, status, file_url, file_key, file_extension) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [user_id, first_name, last_name, sport, description, government_id, registration_number, phone_number, course_title, year_of_admission, education_level, city, status, file_url, file_key, path.extname(file.originalname)]
    );

    // Only send the email if the status is 'submitted'
    if (status === 'submitted') {
      let adminEmails;
      try {
        const [admins] = await db.query('SELECT email FROM users WHERE role = "admin"');
        adminEmails = admins.map(admin => admin.email);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error while fetching admin emails' });
      }

      const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #002660; font-size: 24px;">New Sports Scholarship Request</h2>
          <p>A new sports scholarship request has been submitted by ${first_name} ${last_name}.
          <p>You can review the request <a href="http://localhost:3000/admin-dashboard/new-requests">here</a></p>
        </div>
      </div>
    `;
    
    const msg = {
      to: adminEmails,
      from: 'st018940@stud.frederick.ac.cy',
      subject: 'New Sports Scholarship Request',
      html: htmlContent
    };
      
      try {
        await sgMail.sendMultiple(msg);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error while sending notification emails' });
      }
    }

    res.status(201).json({ message: 'Scholarship request created successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size is too large. Maximum size allowed is 2MB' });
    }
    if (err.code === 'ERR_MULTER_INVALID_FILE_EXTENSION') {
      return res.status(400).json({ message: 'Invalid file type. Only jpg, png, and pdf files are allowed' });
    }
    if (err.message === 'Missing credentials in config') {
      return res.status(500).json({ message: 'Missing AWS credentials' });
    }
    if (err.code === 'NoSuchBucket') {
      return res.status(500).json({ message: 'The specified bucket does not exist' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.generatePresignedUrl = async (req, res) => {
  try {
    // Fetch the file details from the database using req.params.key
    const [fileData] = await db.query('SELECT file_key, file_extension, first_name, last_name, sport FROM scholarship_requests WHERE file_key = ?', [req.params.key]);

    // Extract the extension from the file_key
    const extension = fileData[0].file_key.split('.').pop();

    // Create a filename in the format FirstName_LastName_Sport.extension
    const filename = `${fileData[0].first_name}_${fileData[0].last_name}_${fileData[0].sport}.${extension}`;

    const command = new GetObjectCommand({
      Bucket: 'frederickscholarships',
      Key: req.params.key,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
      ResponseContentType: `application/${fileData[0].file_extension}`
    });
    

    // Generate the pre-signed URL
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.status(200).json({ presignedUrl: signedUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate presigned URL' });
  }
};




exports.getRequests = async (req, res) => {
  try {
    const user_id = req.user.id; 
    const [requests] = await db.query(`
      SELECT scholarship_requests.*, reviews.manager_comment 
      FROM scholarship_requests 
      LEFT JOIN reviews 
      ON scholarship_requests.id = reviews.request_id 
      WHERE scholarship_requests.user_id = ?
    `, [user_id]);

    res.status(200).json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.updateRequest = async (req, res) => {
  try {
    const errors = validateRequest(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation error', errors });
    }

    let { 
      first_name, 
      last_name, 
      sport, 
      description, 
      government_id, 
      registration_number, 
      phone_number, 
      course_title, 
      year_of_admission,
      education_level, 
      city
    } = req.body;
    const user_id = req.user.id;
    const requestId = req.params.id;

    const [existingRequests] = await db.query('SELECT * FROM scholarship_requests WHERE id = ? AND user_id = ?', [requestId, user_id]);

    if (existingRequests.length === 0) {
      return res.status(404).json({ message: 'Scholarship request not found or you do not have permission to update it' });
    }


    // If registration_number is not provided or is an empty string, set it to null
    if (!registration_number) {
      registration_number = null;
    }

    const file = req.file;
    let file_url = null;
    let file_key = null; // Initialize the file key
    let file_extension = null; // Initialize the file extension

    if (file) {
      // Capture the file extension
      file_extension = path.extname(file.originalname);

      // Delete the old file from S3
      if (existingRequests[0].file_key) {
        const deleteParams = {
          Bucket: 'frederickscholarships',
          Key: existingRequests[0].file_key
        };
        await s3.send(new DeleteObjectCommand(deleteParams));
      }

      // Upload the new file to S3
      const Key = `${Date.now().toString()}${file_extension}`; // Add the file extension to the Key
      const params = {
        Bucket: 'frederickscholarships',
        Key,
        Body: file.buffer
      };
      await s3.send(new PutObjectCommand(params));
      // Construct the file URL
      file_url = `https://${params.Bucket}.s3.eu-north-1.amazonaws.com/${Key}`;
      file_key = Key; // Save the key for database storage
    }


    const status = req.body.status;


    if ((existingRequests[0].status === 'draft' || existingRequests[0].status === 'requires_more_info') && status === 'submitted') {
      // Get all admins' emails from the database
      let adminEmails;
      try {
        const [admins] = await db.query('SELECT email FROM users WHERE role = "admin"');
        adminEmails = admins.map(admin => admin.email);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error while fetching admin emails' });
      }

      // HTML content for the email
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #002660; font-size: 24px;">New Sports Scholarship Request</h2>
      <p>A new sports scholarship request has been submitted by ${first_name} ${last_name}.
      <p>You can review the request <a href="http://localhost:3000/admin-dashboard/new-requests">here</a></p>
    </div>
  </div>
`;

const msg = {
  to: adminEmails,
  from: 'st018940@stud.frederick.ac.cy',
  subject: 'New Sports Scholarship Request',
  html: htmlContent
};

      // Send email notification to admins when new request is made
      try {
        await sgMail.sendMultiple(msg);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error while sending notification emails' });
      }
    }

    console.log("Status:", status);


    // Update database record
    await db.query(
      'UPDATE scholarship_requests SET first_name = ?, last_name = ?, sport = ?, description = ?, government_id = ?, registration_number = ?, phone_number = ?, course_title = ?, year_of_admission = ?, education_level = ?, city = ?, status = ?, file_url = ?, file_key = ?, file_extension = ? WHERE id = ? AND user_id = ?',
      [first_name, last_name, sport, description, government_id, registration_number, phone_number, course_title, year_of_admission, education_level, city, status, file_url, file_key, file_extension, requestId, user_id]
    ); 

    res.status(200).json({ message: 'Scholarship request updated successfully' });
    } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
    }
    };


exports.getRequest = async (req, res) => {
  try {
    const user_id = req.user.id;
    const requestId = req.params.id;

    const [existingRequests] = await db.query('SELECT * FROM scholarship_requests WHERE id = ? AND user_id = ?', [requestId, user_id]);

    if (existingRequests.length === 0) {
      return res.status(404).json({ message: 'Scholarship request not found or you do not have permission to view it' });
    }

    res.status(200).json(existingRequests[0]);
  } catch (err) {
    console.error('Error fetching request: ', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.deleteRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const user_id = req.user.id;

    // Fetch the current request to check if it exists and belongs to the user
    const [existingRequests] = await db.query('SELECT * FROM scholarship_requests WHERE id = ? AND user_id = ?', [requestId, user_id]);

    if (existingRequests.length === 0) {
      return res.status(404).json({ message: 'Scholarship request not found or you do not have permission to delete it' });
    }

    if (existingRequests[0].status === 'submitted') {
      return res.status(400).json({ message: 'You cannot delete a request that is waiting for approval.' });
    }

    // If the request being deleted is a duplicate, update the original request
    if (existingRequests[0].original_request_id) {
      await db.query('UPDATE scholarship_requests SET has_been_duplicated = false, original_request_id = NULL WHERE id = ?', [existingRequests[0].original_request_id]);
    }

    // Delete related reviews
    await db.query('DELETE FROM reviews WHERE request_id = ?', [requestId]);

    // Delete the request
    await db.query('DELETE FROM scholarship_requests WHERE id = ? AND user_id = ?', [requestId, user_id]);

    res.status(200).json({ message: 'Scholarship request deleted successfully', request: existingRequests[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.managerDeleteRequest = async (req, res) => {
  try {
    const requestId = req.params.id;

    // Fetch the current request to check if it is a duplicate
    const [existingRequests] = await db.query('SELECT * FROM scholarship_requests WHERE id = ?', [requestId]);

    if (existingRequests.length === 0) {
      return res.status(404).json({ message: 'Scholarship request not found' });
    }

    // If the request being deleted is a duplicate, update the original request
    if (existingRequests[0].original_request_id) {
      await db.query('UPDATE scholarship_requests SET has_been_duplicated = false WHERE id = ?', [existingRequests[0].original_request_id]);
    }

    // Delete related reviews
    await db.query('DELETE FROM reviews WHERE request_id = ?', [requestId]);

    // Delete the request
    await db.query('DELETE FROM scholarship_requests WHERE id = ?', [requestId]);

    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getNewRequests = async (req, res) => {
  try {
    const [requests] = await db.query('SELECT * FROM scholarship_requests WHERE status = "submitted"');

    res.status(200).json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const requestId = req.params.id;
    const newStatus = req.body.status;

    // Validate new status
    if (!['draft', 'submitted', 'requires_more_info', 'approved'].includes(newStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update status in the database
    await db.query('UPDATE scholarship_requests SET status = ? WHERE id = ?', [newStatus, requestId]);

    res.status(200).json({ message: 'Scholarship request status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNewRequestsCount = async (req, res) => {
  try {
    const [requests] = await db.query('SELECT COUNT(*) as count FROM scholarship_requests WHERE status = "submitted"');

    res.status(200).json(requests[0].count);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPendingApprovalsCount = async (req, res) => {
  try {
    const [requests] = await db.query('SELECT COUNT(*) as count FROM scholarship_requests WHERE status = "admin_reviewed"');

    res.status(200).json(requests[0].count);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.adminReview = async (req, res) => {
  const { requestId, ...adminReview } = req.body;
  let { percentage, scholarshipCategory, otherScholarship, otherScholarshipPercentage, adminFullName, date, comments } = adminReview;

  // Convert empty strings to null for integer fields
  percentage = percentage !== '' ? percentage : null;
  otherScholarshipPercentage = otherScholarshipPercentage !== '' ? otherScholarshipPercentage : null;


  comments = comments !== '' ? comments : null;


  // Signature is the same as admin full name
  const signature = adminFullName;

  // Validate admin request
  const errors = validateAdminRequest(req.body);
  if (Object.keys(errors).length > 0) {
    // If there are errors, send them back in the response
    return res.status(400).json({ errors });
  }

  try {
    // Check if review already exists for this request
    const [existingReviews] = await db.query('SELECT * FROM reviews WHERE request_id = ?', [requestId]);

    if (existingReviews.length > 0) {
      // Update existing review
      await db.query(`
        UPDATE reviews 
        SET percentage = ?, scholarship_category = ?, other_scholarship = ?, other_scholarship_percentage = ?, admin_full_name = ?, signature = ?, date = ?, comments = ?
        WHERE request_id = ?
      `, [percentage, scholarshipCategory, otherScholarship, otherScholarshipPercentage, adminFullName, signature, date, comments, requestId]);
    } else {
      // Insert new review
      await db.query(`
        INSERT INTO reviews (request_id, percentage, scholarship_category, other_scholarship, other_scholarship_percentage, admin_full_name, signature, date, comments)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [requestId, percentage, scholarshipCategory, otherScholarship, otherScholarshipPercentage, adminFullName, signature, date, comments]);
    }

    await db.query(`
      UPDATE scholarship_requests
      SET status = 'admin_reviewed'
      WHERE id = ?
    `, [requestId]);

    // Notify managers via email
    let managerEmails;
    try {
      const [managers] = await db.query('SELECT email FROM users WHERE role = "manager"');
      managerEmails = managers.map(manager => manager.email);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error while fetching manager emails' });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <style>
          @media (min-width: 640px) {
            .text-size-desktop {
              font-size: 16px;
            }
          }
        </style>
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #002660; font-size: 24px;" class="text-size-desktop">A Scholarship Request Needs Final Approval</h2>
          <p class="text-size-desktop">This scholarship request has been reviewed by ${adminFullName}. Below are the review details:</p>
          <ul class="text-size-desktop">
            <li><strong>Admin Comments:</strong> ${comments || "None"}</li>
            <li><strong>Scholarship Category:</strong> ${scholarshipCategory || "N/A"}</li>
            <li><strong>Percentage:</strong> ${percentage || "N/A"}%</li>
          </ul>
          <p class="text-size-desktop">Please <a href="http://localhost:3000/manager-dashboard/pending-approvals">review the request</a> for final approval.</p>
        </div>
      </div>
      `;

      const msg = {
        to: managerEmails,
        from: 'st018940@stud.frederick.ac.cy',
        subject: 'A Scholarship Request Needs Final Approval',
        html: htmlContent
      };
              
    try {
      await sgMail.sendMultiple(msg);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error while sending notification emails to managers' });
    }

    res.json({ message: 'Review submitted' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'There was a problem processing your request. Please check the form fields and try again.' });
  }
};



exports.getOpenRequestsCount = async (req, res) => {
  try {
    const [requests] = await db.query('SELECT COUNT(*) as count FROM scholarship_requests WHERE status = "open"');
    res.status(200).json(requests[0].count);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOpenRequests = async (req, res) => {
  try {
    const [requests] = await db.query(`
      SELECT sr.*, r.percentage, r.scholarship_category, r.other_scholarship, r.other_scholarship_percentage, r.admin_full_name, r.date, r.comments, r.signature
      FROM scholarship_requests sr
      LEFT JOIN reviews r ON sr.id = r.request_id
      WHERE sr.status IN ("open", "admin_reviewed")
      `);
    res.status(200).json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLatestRequestStatus = async (req, res) => {
  try {
    const user_id = req.user.id; 
    const [requests] = await db.query(
      'SELECT * FROM scholarship_requests WHERE user_id = ? AND (status = ? OR status = ? OR status = ? OR status = ? OR status = ?) ORDER BY created_at DESC LIMIT 1', 
      [user_id, 'submitted', 'requires_more_info', 'admin_reviewed', 'approved', 'denied']
    );
    

    if (requests.length > 0) {
      res.status(200).json({ status: requests[0].status });
    } else {
      res.status(200).json({ status: 'no requests' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getPendingApprovalRequests = async (req, res) => {
  try {
    const [requests] = await db.query(`
      SELECT sr.*, r.percentage, r.scholarship_category, r.other_scholarship, r.other_scholarship_percentage, r.admin_full_name, r.date, r.comments
      FROM scholarship_requests sr
      LEFT JOIN reviews r ON sr.id = r.request_id
      WHERE sr.status = 'admin_reviewed'
    `);
    res.status(200).json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLatestPendingRequestStatus = async (req, res) => {
  try {
    const user_id = req.user.id; 
    const [requests] = await db.query('SELECT * FROM scholarship_requests WHERE user_id = ? AND (status = ? OR status = ? OR status = ?) ORDER BY created_at DESC LIMIT 1', 
    [user_id, 'submitted', 'requires_more_info', 'admin_reviewed']);

    if (requests.length > 0) {
      res.status(200).json({ status: requests[0].status });
    } else {
      res.status(200).json({ status: 'no requests' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.approve = async (req, res) => {
  const { requestId, editedAdminForm, managerComment } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `UPDATE scholarship_requests SET status = ? WHERE id = ?`,
      ['approved', requestId]
    );

    if (rows.affectedRows !== 1) {
      throw new Error(`Could not update status of request id ${requestId}`);
    }

    const [rows2] = await connection.query(
      `UPDATE reviews SET percentage = ?, scholarship_category = ?, other_scholarship = ?, other_scholarship_percentage = ?, manager_comment = ? WHERE request_id = ?`,
      [editedAdminForm.percentage, editedAdminForm.scholarship_category, editedAdminForm.other_scholarship, editedAdminForm.other_scholarship_percentage, managerComment, requestId]
    );

    if (rows2.affectedRows !== 1) {
      throw new Error(`Could not update review for request id ${requestId}`);
    }

    // Fetch the user_id of the request being approved
    const [[request]] = await connection.query(
      'SELECT * FROM scholarship_requests WHERE id = ? LIMIT 1', 
      [requestId]
    );
    const userId = request.user_id;

    // Fetch the latest request status after approving a request
    const [requests] = await connection.query(
      'SELECT * FROM scholarship_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', 
      [userId]
    );

    if (requests.length > 0) {
      res.status(200).json({ message: 'Request has been approved.', status: requests[0].status });
    } else {
      throw new Error('Error fetching latest request status');
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};



exports.deny = async (req, res) => {
  const { requestId, editedAdminForm, managerComment } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `UPDATE scholarship_requests SET status = ? WHERE id = ?`,
      ['denied', requestId]
    );

    if (rows.affectedRows !== 1) {
      throw new Error(`Could not update status of request id ${requestId}`);
    }

    const [rows2] = await connection.query(
      `UPDATE reviews SET percentage = ?, scholarship_category = ?, other_scholarship = ?, other_scholarship_percentage = ?, manager_comment = ? WHERE request_id = ?`,
      [editedAdminForm.percentage, editedAdminForm.scholarship_category, editedAdminForm.other_scholarship, editedAdminForm.other_scholarship_percentage, managerComment, requestId]
    );

    if (rows2.affectedRows !== 1) {
      throw new Error(`Could not update review for request id ${requestId}`);
    }

    await connection.commit();

    res.status(200).json({ message: 'Request has been denied.' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

exports.getApprovedRequests = async (req, res) => {
  try {
    const query = `
    SELECT scholarship_requests.*, scholarship_requests.file_key, reviews.percentage, reviews.scholarship_category, reviews.other_scholarship, reviews.manager_comment, reviews.other_scholarship_percentage
    FROM scholarship_requests
    LEFT JOIN reviews ON scholarship_requests.id = reviews.request_id
    WHERE status = 'approved';
    
    `;
    const [requests] = await db.query(query);
    res.status(200).json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.duplicateRequest = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Fetch the latest approved request for the user
    const [approvedRequests] = await db.query('SELECT * FROM scholarship_requests WHERE user_id = ? AND status = ? ORDER BY id DESC LIMIT 1', [user_id, 'approved']);

    if (approvedRequests.length === 0) {
      return res.status(400).json({ message: 'You do not have an approved request to duplicate.' });
    }

    const approvedRequest = approvedRequests[0];

    // Check if the request has been duplicated and the duplicate is not approved
    const [duplicates] = await db.query('SELECT * FROM scholarship_requests WHERE original_request_id = ? AND status != "approved"', [approvedRequest.id]);
    if (duplicates.length > 0) {
      return res.status(400).json({ message: 'This request has already been duplicated for the next year.' });
    }

    // Update all other requests for this user, set original_request_id to null
    await db.query('UPDATE scholarship_requests SET original_request_id = NULL WHERE user_id = ?', [user_id]);

    // Set has_been_duplicated to true for the original request
    await db.query('UPDATE scholarship_requests SET has_been_duplicated = true WHERE id = ?', [approvedRequest.id]);

    // Remove unique fields from the existing request
    const { id, created_at, updated_at, last_duplicated_at, ...requestToDuplicate } = approvedRequest;

    // Insert the duplicated request into the database
    await db.query(
      'INSERT INTO scholarship_requests SET ?', 
      { ...requestToDuplicate, user_id, status: 'draft', last_duplicated_at: new Date(), original_request_id: id }
    );

    // Fetch the new request to send it back in the response
    const [[newRequest]] = await db.query('SELECT * FROM scholarship_requests ORDER BY id DESC LIMIT 1');

    // Return also the id of the original request
    res.status(200).json({ request: newRequest, original_request_id: id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};