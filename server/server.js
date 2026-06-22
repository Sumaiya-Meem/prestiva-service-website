const express = require('express');

const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (optional — skips gracefully if MONGODB_URI is unset)
connectDB();

app.get('/', (req, res) => {
  res.send('Prestiva Backend Server Running');
});

// Basic Route
app.use('/api/health', (req, res) => res.json({ status: 'OK' }));

// Routes
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
