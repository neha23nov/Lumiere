// server.js — FINAL VERSION
require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

// import routes
const authRoutes = require('./src/routes/auth.routes');
const postRoutes = require('./src/routes/post.routes');
const userRoutes = require('./src/routes/user.routes');

// import cron job — just importing it starts the schedule
require('./src/jobs/starOfWeek.job');

const app = express();


app.use(cors({
  origin: "https://lumiere-blond.vercel.app",
  credentials: true
}));
app.use(express.json());

// mount routes
// all requests starting with /api/auth → auth.routes.js
// all requests starting with /api/posts → post.routes.js
// all requests starting with /api/users → user.routes.js

app.use('/api/auth',  authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Framr backend is running!' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected ✓');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} ✓`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });