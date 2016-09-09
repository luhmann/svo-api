import mongoose from 'mongoose'
const Schema = mongoose.Schema

export default new Schema({
  name: String,
  description: String,
  objectId: { type: String, required: true }
})
