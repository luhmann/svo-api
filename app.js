// @flow
import bodyParser from 'body-parser'
import cors from 'cors'
import feathers from 'feathers'
import hooks from 'feathers-hooks'
import mongoose from 'mongoose'
import mongooseService from 'feathers-mongoose'
import uniqueSlug from 'unique-slug'

import Recipe from './model/RecipeModel.js'

const app = feathers()
const prefix = 'api/v1'

// enable cors
app.use(cors())

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/svo', (err, connection) => {
  if (err) {
    throw err
  }
})

app.configure(hooks())

// Setup a rest interface
app.configure(feathers.rest())

// Parse JSON and form HTTP bodies
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Use the service object
app.use(`${prefix}/recipe`, mongooseService({
  name: 'recipe',
  Model: Recipe
}))

app.use((error, req, res, next) => {
  res.json(error)
})

app
  .service(`${prefix}/recipe`)
  .before({
    create: (hook, next) => {
      hook.data.hash = uniqueSlug(hook.data.slug)
      next()
    }
  })

// Start the application on port 3030
app.listen(3030, () => {
  console.log('App is now listening on port 3030')
})
