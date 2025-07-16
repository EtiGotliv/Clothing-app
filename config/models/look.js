import mongoose from 'mongoose';

const lookSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    image: String,
    category: String,
    color: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  style: {
    type: String  
  },
  season: {
    type: String 
  },
  favorited: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['smart_learning', 'basic_preferences', 'ai', 'random'],
    default: 'random'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  }
});

const Look = mongoose.model('Look', lookSchema);
export default Look;