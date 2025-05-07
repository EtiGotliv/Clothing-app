// config/models/allClothing.js
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
  tags: {
    type: [String],
    default: []
  },
  image: {
    type: String,
    required: true
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