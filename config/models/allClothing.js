import mongoose from 'mongoose';

const clothingSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  color: { type: String },
  image: { type: String, required: true }, 
  tags: [String]
});

const Clothing = mongoose.model('Clothing', clothingSchema);
export default Clothing;
