import mongoose from 'mongoose';

const clothingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String },
  image: { type: String, required: true },
  tags: { type: [String], default: [] }
});

// פונקציות עזר למודל
clothingSchema.statics.getAllClothing = async function() {
  return await this.find({});
};

clothingSchema.statics.getClothingById = async function(id) {
  return await this.findOne({ _id: id });
};

// ציון שם האוסף בפועל כ-"clothing"
const Clothing = mongoose.model('clothing', clothingSchema, 'clothing');
export default Clothing;
