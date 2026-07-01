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
// Filenames are content-unique (random ids) and never change once written, so
// they can be cached aggressively by browsers/CDNs — repeat visits load the
// images/videos instantly instead of re-downloading them.
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '30d',
  immutable: true,
}));

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
app.use('/api/backgrounds', require('./routes/backgroundRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
