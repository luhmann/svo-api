import mongoose from 'mongoose'
const Schema = mongoose.Schema

export default new Schema({
  skinny: Boolean,
  glutenFree: Boolean,
  restTime: Boolean,
  vegetarian: Boolean
})
