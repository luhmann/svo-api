import mongoose from 'mongoose'
const Schema = mongoose.Schema

export default new Schema({
  credits: String,
  objectId: { type: String, required: true }
})
