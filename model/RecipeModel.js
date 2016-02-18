import mongoose from 'mongoose'
const Schema = mongoose.Schema

const RecipeSchema = new Schema({
  slug: { type: String, required: true, index: { unique: true } },
  hash: { type: String, index: { unique: true } },
  title: { type: String, required: true },
  subtitle: { type: String },
  created: { type: Date, 'default': Date.now },
  modified: { type: Date, 'default': Date.now },
  published: { type: Date, 'default': Date.now },
  category: { type: String, required: true },
  author: Schema.Types.Mixed,
  duration: Schema.Types.Mixed,
  servings: Number,
  calories: Number,
  protein: Number,
  fat: Number,
  carbs: Number,
  difficulty: Number,
  images: [ Schema.Types.Mixed ],
  cover: [ Schema.Types.Mixed ],
  ingredients: { type: [ Schema.Types.Mixed ], required: true },
  preparation: { type: [ Schema.Types.Mixed ], required: true },
  quickinfo: Schema.Types.Mixed,
  utensils: [],
  wine: String,
  dessert: String
})

const RecipeModel = mongoose.model('recipes', RecipeSchema)

export default RecipeModel
