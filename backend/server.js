require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/database');
const { logger, requestLoggerMiddleware } = require('./utils/logger');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request/Response logging middleware with Pino
app.use(requestLoggerMiddleware);

// MongoDB Connection
connectDB();

// Routes
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the Notes API',
    version: '1.0.0',
    database: 'notes',
    collections: ['users', 'notes']
  });
});

// Database info endpoint (for development only)
app.get('/api/db-info', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not available in production' });
  }
  
  const { getDBStats, listCollections } = require('./config/database');
  try {
    const stats = await getDBStats();
    const collections = await listCollections();
    res.json({ stats, collections });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching database info', error: error.message });
  }
});

// Error handling middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info({
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    url: `http://localhost:${PORT}`,
  }, `Server started on port ${PORT}`);
});
