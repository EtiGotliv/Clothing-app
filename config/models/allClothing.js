// config/models/allClothing.js
import mongoose from 'mongoose';

const clothingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String },
  image: { type: String, required: true },
  tags: { type: [String], default: [] },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }
});

// פונקציות סטטיות (אופציונלי)
clothingSchema.statics.getAllClothing = async function() {
  return await this.find({});
};

clothingSchema.statics.getClothingById = async function(id) {
  return await this.findOne({ _id: id });
};

// ציון שם האוסף במפורש
const Clothing = mongoose.model("clothing", clothingSchema, "clothing");

export default Clothing;
