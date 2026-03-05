const app = require('./app');
const connectDB = require('./config/database');
const { initGridFS } = require('./config/gridfs');

const PORT = process.env.PORT || 4000;

// Connect to database and initialize GridFS after connection
const startServer = async () => {
  try {
    await connectDB();
    // Initialize GridFS after database connection
    initGridFS();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Beyond Grades Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`💾 Database: Connected to MongoDB`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
