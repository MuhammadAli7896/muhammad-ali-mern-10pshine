const mongoose = require('mongoose');
const { logger, logDatabase } = require('../utils/logger');

/**
 * MongoDB Database Configuration
 * Database: notes
 * Collections: users, notes
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/notes'
    );

    logDatabase('connected', {
      database: conn.connection.db.databaseName,
      host: conn.connection.host,
      port: conn.connection.port,
    });

    // Log collections when they're created
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'Mongoose connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.fatal({ err: error }, 'MongoDB Connection Error');
    process.exit(1);
  }
};

/**
 * Get database statistics
 */
const getDBStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      database: mongoose.connection.db.databaseName,
      collections: stats.collections,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
    };
  } catch (error) {
    logger.error({ err: error }, 'Error getting DB stats');
    return null;
  }
};

/**
 * List all collections in the database
 */
const listCollections = async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    return collections.map(col => col.name);
  } catch (error) {
    logger.error({ err: error }, 'Error listing collections');
    return [];
  }
};

module.exports = {
  connectDB,
  getDBStats,
  listCollections,
};
