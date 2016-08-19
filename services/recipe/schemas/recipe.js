import mongoose from 'mongoose'
import durationSchema from './duration'
import imageSchema from './image'
import ingredientSchema from './ingredient'
import stepSchema from './preparationStep'
import quickinfoSchema from './quickinfo'

const Schema = mongoose.Schema

const RecipeSchema = new Schema({
  slug: { type: String, required: true, index: { unique: true } },
  hash: { type: String, index: { unique: true } },
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  created: { type: Date, default: Date.now },
  modified: { type: Date, default: Date.now },
  published: { type: Date, default: Date.now },
  category: { type: String, required: true },
  author: Schema.Types.ObjectId,
  duration: durationSchema,
  servings: Number,
  calories: Number,
  protein: Number,
  fat: Number,
  carbs: Number,
  images: [ imageSchema ],
  cover: imageSchema,
  ingredients: { type: [ ingredientSchema ], required: true },
  preparation: { type: [ stepSchema ], required: true },
  quickinfo: quickinfoSchema,
  utensils: [ String ],
  wine: String,
  dessert: String
})

export default mongoose.model('recipes', RecipeSchema)
