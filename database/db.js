const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from the .env file
dotenv.config();

// Get the MongoDB connection URI from environment variables
const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  }
};
// Export the connection function
module.exports = connectDB;
