const mongoose = require("mongoose");
const mongoUri = process.env.MONGO_URI;
async function connectDB() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}
module.exports = connectDB;
