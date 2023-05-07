
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require('./routes/auth.routes');
const passwordRoutes = require('./routes/password');
const scholarshipRoutes = require('./routes/scholarship.routes');


app.use('/api/auth', authRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/scholarship', scholarshipRoutes);


// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
 