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
  }
});

const Look = mongoose.model('Look', lookSchema);
export default Look;
