import mongoose from 'mongoose'
const Schema = mongoose.Schema

export default new Schema({
  amount: Number,
  unit: String,
  label: { type: String, required: true }
})
