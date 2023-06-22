const db = require('../config/db.config');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { validateRequest } = require('./validateRequest');
const { validateAdminRequest } = require('./validateAdminRequest');


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
      academic_year, 
      education_level, 
      city, 
      status // Get the status from the client-side
    } = req.body;

    const user_id = req.user.id;

    const [existingRequests] = await db.query('SELECT * FROM scholarship_requests WHERE user_id = ? AND (status = ? OR status = ?)', [user_id, 'submitted', 'requires_more_info']);


    if (existingRequests.length > 0) {
      return res.status(400).json({ message: 'You already have a request that is waiting for approval. Please wait until it is processed.' });
    }

    // If registration_number is not provided or is an empty string, set it to null
    if (!registration_number) {
      registration_number = null;
    }

    await db.query(
      'INSERT INTO scholarship_requests (user_id, first_name, last_name, sport, description, government_id, registration_number, phone_number, course_title, academic_year, education_level, city, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [user_id, first_name, last_name, sport, description, government_id, registration_number, phone_number, course_title, academic_year, education_level, city, status]
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

      const msg = {
        to: adminEmails,
        from: 'st018940@stud.frederick.ac.cy',
        subject: 'New Sports Scholarship Request',
        text: `A new sports scholarship request has been submitted. Please review it here: http://localhost:3000/admin-dashboard/new-requests`,
        html: `<p>A new sports scholarship request has been submitted. Please review it <a href="http://localhost:3000/admin-dashboard/new-requests">here</a>.</p>`
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
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getRequests = async (req, res) => {
  try {
    const user_id = req.user.id; 
    const [requests] = await db.query('SELECT * FROM scholarship_requests WHERE user_id = ?', [user_id]);

    res.status(200).json({ requests });
  } catch (err) {
    console.error(err);
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

    await db.query('DELETE FROM scholarship_requests WHERE id = ? AND user_id = ?', [requestId, user_id]);

    res.status(200).json({ message: 'Scholarship request deleted successfully' });
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
      academic_year, 
      education_level, 
      city, 
      status 
    } = req.body;
    const user_id = req.user.id;
    const requestId = req.params.id;

    const [existingRequests] = await db.query('SELECT * FROM scholarship_requests WHERE id = ? AND user_id = ?', [requestId, user_id]);

    if (existingRequests.length === 0) {
      return res.status(404).json({ message: 'Scholarship request not found or you do not have permission to update it' });
    }

    if (existingRequests[0].status === 'submitted') {
      return res.status(400).json({ message: 'You cannot edit a request that is waiting for approval.' });
    }

     // If registration_number is not provided or is an empty string, set it to null
     if (!registration_number) {
      registration_number = null;
    }

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

      //the email contents
      const msg = {
        to: adminEmails,
        from: 'st018940@stud.frederick.ac.cy',
        subject: 'New Sports Scholarship Request',
        text: `A sports scholarship request has been submitted. Please review it here: http://localhost:3000/admin-dashboard/new-requests`,
        html: `<p>A sports scholarship request has been submitted. Please review it <a href="http://localhost:3000/admin-dashboard/new-requests">here</a>.</p>`
      };

      // Send an email notification to all admins when a new request is made
      try {
        await sgMail.sendMultiple(msg);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error while sending notification emails' });
      }
    }

    await db.query('UPDATE scholarship_requests SET first_name = ?, last_name = ?, sport = ?, description = ?, government_id = ?, registration_number = ?, phone_number = ?, course_title = ?, academic_year = ?, education_level = ?, city = ?, status = ? WHERE id = ? AND user_id = ?', [first_name, last_name, sport, description, government_id, registration_number, phone_number, course_title, academic_year, education_level, city, status, requestId, user_id]);


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

    // Fetch the specific request to check if it exists and belongs to the user
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
    if (!['draft', 'submitted', 'requires_more_info'].includes(newStatus)) {
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

exports.adminReview = async (req, res) => {
  const { requestId, ...adminReview } = req.body;
  let { percentage, scholarshipCategory, otherScholarship, otherScholarshipPercentage, adminFullName, date, comments } = adminReview;

  // Convert empty strings to null for integer fields
  percentage = percentage !== '' ? percentage : null;
  otherScholarshipPercentage = otherScholarshipPercentage !== '' ? otherScholarshipPercentage : null;

  // Validate admin request
  const errors = validateAdminRequest(req.body);
  if (Object.keys(errors).length > 0) {
    // If there are errors, send them back in the response
    return res.status(400).json({ errors });
  }

  try {
    await db.query(`
      INSERT INTO reviews (request_id, percentage, scholarship_category, other_scholarship, other_scholarship_percentage, admin_full_name, date, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [requestId, percentage, scholarshipCategory, otherScholarship, otherScholarshipPercentage, adminFullName, date, comments]);

    await db.query(`
      UPDATE scholarship_requests
      SET status = 'admin_reviewed'
      WHERE id = ?
    `, [requestId]);

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
      SELECT sr.*, r.percentage, r.scholarship_category, r.other_scholarship, r.other_scholarship_percentage, r.admin_full_name, r.date, r.comments
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
    const [requests] = await db.query('SELECT * FROM scholarship_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [user_id]);

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



