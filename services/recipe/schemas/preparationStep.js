import mongoose from 'mongoose'
import ingredientSchema from './ingredient'
const Schema = mongoose.Schema

export default new Schema({
  step: Number,
  description: { type: String, required: true },
  ingredients: [ ingredientSchema ],
  type: String
})
