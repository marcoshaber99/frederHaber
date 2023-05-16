const db = require('../config/db.config');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { validateRequest } = require('./validateRequest');


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
      status 
    } = req.body;

    const user_id = req.user.id;

    // If registration_number is not provided or is an empty string, set it to null
    if (!registration_number) {
      registration_number = null;
    }

    await db.query(
      'INSERT INTO scholarship_requests (user_id, first_name, last_name, sport, description, government_id, registration_number, phone_number, course_title, academic_year, education_level, city, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [user_id, first_name, last_name, sport, description, government_id, registration_number, phone_number, course_title, academic_year, education_level, city, status]
    );

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

    // Fetch the current request to check if it exists and belongs to the user
    const [existingRequests] = await db.query('SELECT * FROM scholarship_requests WHERE id = ? AND user_id = ?', [requestId, user_id]);

    if (existingRequests.length === 0) {
      return res.status(404).json({ message: 'Scholarship request not found or you do not have permission to update it' });
    }

     // If registration_number is not provided or is an empty string, set it to null
     if (!registration_number) {
      registration_number = null;
    }

    // Check if the request was previously a draft and is now being submitted
    if (existingRequests[0].status === 'draft' && status === 'submitted') {
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



