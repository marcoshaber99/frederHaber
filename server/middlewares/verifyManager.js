const db = require('../config/db.config');

const verifyManager = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    // Fetch  user's role from the database
    const [users] = await db.query('SELECT role FROM users WHERE id = ?', [user_id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    if (user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If  user is an manager, call the next middleware
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = verifyManager;