import mongoose from 'mongoose'
const Schema = mongoose.Schema

export default new Schema({
  preparation: Number,
  cooking: Number,
  cooling: Number
})
