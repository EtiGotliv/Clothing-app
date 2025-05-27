import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Clothing from '../config/models/allClothing.js';

dotenv.config();

const mongoURI = `mongodb+srv://site_data_user:${process.env.MONGO_DB_PASSWORD}@tabble-all-clothing.ijibl.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;

(async () => {
  await mongoose.connect(mongoURI);

  console.log("🔍 בדיקת בגדים במסד הנתונים...\n");

  const totalClothes = await Clothing.countDocuments();
  console.log(`📊 סך הכל בגדים במסד נתונים: ${totalClothes}`);

  const userIds = await Clothing.distinct('user');
  console.log(`👥 משתמשים עם בגדים: ${userIds.length}`);
  console.log("רשימת User IDs:");
  userIds.forEach((id, index) => {
    console.log(`${index + 1}. ${id}`);
  });

  const currentUserId = "665e0b7a1f3c3a2b4c9f0123";
  console.log(`\n🔍 בדיקת בגדים עבור User ID: ${currentUserId}`);

  const userClothes = await Clothing.find({ user: new mongoose.Types.ObjectId(currentUserId) });
  console.log(`📦 נמצאו ${userClothes.length} בגדים עבור המשתמש הזה`);

  if (userClothes.length > 0) {
    console.log("רשימת בגדים:");
    userClothes.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.category || 'ללא קטגוריה'}) - צבע: ${item.color || 'ללא צבע'}`);
    });
  } else {
    console.log("❌ לא נמצאו בגדים עבור המשתמש הזה!");

    const clothesWithoutUser = await Clothing.find({ user: { $exists: false } });
    console.log(`🔍 בגדים ללא user: ${clothesWithoutUser.length}`);

    const allClothes = await Clothing.find().limit(5);
    console.log("\nדוגמאות של בגדים במסד נתונים:");
    allClothes.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - User: ${item.user || 'ללא user'}`);
    });
  }

  await mongoose.disconnect();
})();
