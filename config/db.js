const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // .env me MONGO_URI add karna hoga
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;