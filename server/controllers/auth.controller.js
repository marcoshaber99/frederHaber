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



exports.register = async (req, res) => {
  try {
    const { email, password} = req.body;


    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    let role;
if (email.startsWith('st') && email.includes('@stud.')) {
  role = 'student';
} else if (email.includes('@frederick.')) {
  role = 'unset';
} else if (isValidEmail(email)) {
  role = 'student'; // Assign 'student' role to non-Frederick emails
} else {
  return res.status(400).json({ message: 'Invalid email format' });
}



    // Check if the email already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed password:", hashedPassword);

    // Insert the new user
    const [result] = await db.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hashedPassword, role]);

    if (result.affectedRows === 1) {
      // Send an activation email
      const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });
      const activationLink = `http://localhost:3000/activate/${token}`;
      const msg = {
        to: email,
        from: 'st018940@stud.frederick.ac.cy',
        subject: 'Activate your account',
        text: `Click the following link to activate your account: ${activationLink}`,
        html: `<p>Click the following link to activate your account: <a href="${activationLink}">${activationLink}</a></p>`
      };

      try {
        await sgMail.send(msg);
      } catch (err) {
        console.error(err);
      }

      res.status(201).json({ 
        message: "User registered successfully. Check your email to activate your account."});
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
    console.log('Email:', email); 
    console.log('Password:', password); 

    // Check if the email exists
    const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(400).json({ message: 'Email not found' });
    }
    console.log('User:', user[0]); 

    console.log('Submitted password:', password);
    console.log('Stored hashed password:', user[0].password);
    const isMatch = await bcrypt.compare(password, user[0].password);
    console.log('Is match:', isMatch); 
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Check if the account is active
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

    // Activate the user account (you may need to add an 'is_active' column to the users table)
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
