const crypto = require('crypto');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
const pool = require('../config/db.config');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email exists
    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(400).json({ message: 'Email not found' });
    }

    // Generate a password reset token and expiration
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiration

    // Store the token and expiration in the user record
    await pool.query('UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?', [token, expires, email]);

    // Send a password reset email
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    const msg = {
      to: email,
      from: 'st018940@stud.frederick.ac.cy',
      subject: 'Reset your password',
      text: `Click the following link to reset your password: ${resetLink}`,
      html: `<p>Click the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`
    };

    await sgMail.send(msg);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { password, token } = req.body;

  try {
    const [user] = await pool.query(
      'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()',
      [token]
    );

    if (!user[0] || user[0].length === 0) {
      return res.status(400).json({
        message: 'Invalid or expired password reset token.',
      });
    }

    if (!password) {
      return res.status(400).json({
        message: 'Password is required.',
      });
    }

    // Ensure both data & salt are provided to bcrypt.hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('New hashed password:', hashedPassword);
    console.log('User ID:', user[0].id);

    const result = await pool.query('UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?', [
      hashedPassword,
      user[0].id,
    ]);
    console.log('Password update query result:', result);
    res.status(200).json({
      message: 'Password has been reset.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error',
    });
  }
};