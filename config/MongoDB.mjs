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
      // אפשר להשמיט useUnifiedTopology אם הוא לא משפיע
    });
    console.log("🚀 Connected to MongoDB");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
