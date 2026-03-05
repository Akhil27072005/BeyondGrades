const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    // Connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    
    // Provide helpful error messages
    if (error.code === 'ENOTFOUND' || error.name === 'MongoServerSelectionError') {
      console.error('\n❌ MongoDB connection failed. Please check:');
      console.error('1. Your MONGO_URI in the .env file is correct');
      console.error('2. The MongoDB cluster exists and is accessible');
      console.error('3. Your IP address is whitelisted in MongoDB Atlas (Network Access)');
      console.error('4. Your username and password are correct');
      console.error('\nExample connection strings:');
      console.error('  MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority');
      console.error('  Local MongoDB: mongodb://localhost:27017/beyondgrades');
    }
    
    throw error;
  }
};

module.exports = connectDB;
