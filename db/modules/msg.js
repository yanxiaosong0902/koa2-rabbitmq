import mongoose from 'mongoose'
const Schema = mongoose.Schema

const msg = new Schema({
  userId: {
    type: Number
  },
  writeTime: {
    type: Date,
    default: Date.now()
  }
})
export default mongoose.model('Messages', msg, 'Messages')
