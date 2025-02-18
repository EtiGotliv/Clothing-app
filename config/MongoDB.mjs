// config/MongoDB.mjs
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoURI = `mongodb+srv://site_data_user:${process.env.MONGO_DB_PASSWORD}@tabble-all-clothing.ijibl.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000
    });
    console.log("🚀 Connected to MongoDB");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// הגדרת הסכמה למשתמש
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model("users", userSchema);

export { connectDB, User };
