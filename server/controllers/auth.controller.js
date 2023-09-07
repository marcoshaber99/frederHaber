const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const db = require('../config/db.config');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const isValidEmail = (email) => {
  const studentEmailRegex = /^st\d+@stud\.frederick\.ac\.cy$/i;
  const frederickEmailRegex = /@frederick\.ac\.cy$/i;
  const normalEmailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
  return studentEmailRegex.test(email) || frederickEmailRegex.test(email) || normalEmailRegex.test(email);
};


const validatePasswordComplexity = (password) => {
  // Require at least 5 characters and one number
  const regex = /^(?=.*\d)[A-Za-z\d]{5,}$/;
  return regex.test(password);
};

exports.register = async (req, res) => {
  try {
    const { email, password} = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }


    if (!validatePasswordComplexity(password)) {
      return res.status(400).json({
        message: 'Password must be at least 5 characters long and contain at least one number'
      });
    }

    let role;
    if (email.startsWith('st') && email.includes('@stud.')) {
      role = 'student';
    } else if (email.includes('@frederick.')) {
      role = 'unset';
    } else if (isValidEmail(email)) {
      role = 'student';
    } else {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hashedPassword, role]);

    if (result.affectedRows === 1) {
      const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });
      const activationLink = `http://localhost:3000/activate/${token}`;
       // HTML for the email
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; font-size: 24px;">Activate your account</h2>
        <p>Hello ${email},</p>
        <p>Thank you for registering. To complete your registration, please click the button below:</p>
        <a href="${activationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; border-radius: 4px; text-decoration: none;">Activate Account</a>
        <p>If you did not register for this account, you can safely ignore this email.</p>
        <p>If you have any questions, please <a href="mailto:dl-support@frederick.ac.cy">contact us</a>.</p>
      </div>
    </div>
  `;

  const msg = {
    to: email,
    from: 'st018940@stud.frederick.ac.cy',
    subject: 'Complete Your Registration',
    html: htmlContent,
  };

      await sgMail.send(msg);

      res.status(201).json({ 
        message: "User registered successfully. Check your email to activate your account."
      });
    } else {
      res.status(500).json({ message: 'Error registering user' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //console.log('Email:', email); 
    //console.log('Password:', password); 

    // Check if the email exists
    const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(400).json({ message: 'Email not found' });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }


    if (!user[0].is_active) {
      return res.status(400).json({ message: 'Account not activated' });
    }

    // Create a JWT token
    const token = jwt.sign({ 
      id: user[0].id, 
      role: user[0].role, 
      email: user[0].email 
    }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    })

    res.status(200).json({
      token,
      userRole: user[0].role,
      userEmail: user[0].email,
      firstLogin: !user[0].role_updated,
      message: 'Logged in successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.activate = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid or expired activation link' });
    }
    const { id } = decoded;

    // Activate the user account
    const [result] = await db.query('UPDATE users SET is_active = 1 WHERE id = ?', [id]);

    if (result.affectedRows === 1) {
      res.status(200).json({ message: 'Account activated successfully' });
    } else {
      res.status(400).json({ message: 'Invalid activation link' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.setRole = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!['admin', 'manager'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const [result] = await db.query('UPDATE users SET role = ? WHERE email = ? AND role = "unset"', [role, email]);

    if (result.affectedRows === 1) {
      res.status(200).json({ message: 'Role set successfully' });
    } else {
      res.status(400).json({ message: 'Error setting role' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.roleSelection = async (req, res) => {
  try {
    const { email, role } = req.body;

    console.log(req.body);

    if (role !== 'admin' && role !== 'manager') {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Update user role in the database
    const [result] = await db.query('UPDATE users SET role = ?, role_updated = 1 WHERE email = ?', [role, email]);

    if (result.affectedRows === 1) {
      res.status(200).json({ message: 'Role updated successfully' });
    } else {
      res.status(400).json({ message: 'Error updating user role' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user with the given ID
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      userEmail: user[0].email,
      userRole: user[0].role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
