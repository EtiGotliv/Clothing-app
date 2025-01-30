import mongoose from 'mongoose';

const clothingSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  color: { type: String },
  image: { type: String, required: true },
  tags: [String]
});

// פונקציות עזר למודל
clothingSchema.statics.getAllClothing = async function() {
  return await this.find({});
};

clothingSchema.statics.getClothingById = async function(id) {
  return await this.findOne({ id: id });
};

const Clothing = mongoose.model('clothing', clothingSchema);
export default Clothing;