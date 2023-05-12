const db = require('../config/db.config');

exports.createRequest = async (req, res) => {
  try {
    const { first_name, last_name, sport, description, status } = req.body;
    const user_id = req.user.id;

    await db.query('INSERT INTO scholarship_requests (user_id, first_name, last_name, sport, description, status) VALUES (?, ?, ?, ?, ?, ?)', [user_id, first_name, last_name, sport, description, status]);

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
    const { first_name, last_name, sport, description, status } = req.body;
    const user_id = req.user.id;
    const requestId = req.params.id;

    // Fetch the current request to check if it exists and belongs to the user
    const [existingRequests] = await db.query('SELECT * FROM scholarship_requests WHERE id = ? AND user_id = ?', [requestId, user_id]);

    if (existingRequests.length === 0) {
      return res.status(404).json({ message: 'Scholarship request not found or you do not have permission to update it' });
    }

    await db.query('UPDATE scholarship_requests SET first_name = ?, last_name = ?, sport = ?, description = ?, status = ? WHERE id = ? AND user_id = ?', [first_name, last_name, sport, description, status, requestId, user_id]);

    res.status(200).json({ message: 'Scholarship request updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

