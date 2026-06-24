const express = require('express');
const path = require('path');

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

// Serve admin-uploaded gallery media (created at runtime under /server/uploads).
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
