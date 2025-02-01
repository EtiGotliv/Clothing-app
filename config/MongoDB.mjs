import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUrl = `mongodb+srv://site_data_user:${process.env.MONGO_DB_PASSWORD}` +
  `@tabble-all-clothing.ijibl.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;

// בדיקת כתובת החיבור ל-MongoDB
console.log('🔹 MongoDB URI:', mongoUrl);

// פונקציה להתחברות למסד הנתונים
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000, // Timeout in ms for server selection
    });
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1); // יציאה מהתהליך אם החיבור נכשל
  }
};

export default connectDB;
