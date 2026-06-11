const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://satyam87yadav_db_user:%40Satyam7255@carbontracker.i9fed0t.mongodb.net/carbontracker?retryWrites=true&w=majority"
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    );

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
