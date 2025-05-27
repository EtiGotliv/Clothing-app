
import mongoose from 'mongoose';

const clothingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  season: {
    type: String
  },
  event: {
    type: String
  },
  tags: {
    type: [String],
    default: []
  },
  image: {
    type: String,
    required: true
  },
  image_no_bg: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Clothing = mongoose.models.Clothing || mongoose.model('Clothing', clothingSchema);

export default Clothing;