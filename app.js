// @flow
import bodyParser from 'body-parser'
import cors from 'cors'
import feathers from 'feathers'
import hooks from 'feathers-hooks'
import mongoose from 'mongoose'
import mongooseService from 'feathers-mongoose'
import rest from 'feathers-rest'

import { BASE_URL, DB_URL } from './config/constants.js'
import Recipe from './model/RecipeModel.js'
import { convertDates, getBySlug, validateSlug } from './config/hooks.js'
import errorHandler from 'feathers-errors/handler.js'

const app = feathers()

// enable cors
app.use(cors())

mongoose.Promise = global.Promise
mongoose.connect(DB_URL, (err, connection) => {
  if (err && err.message.indexOf('ECONNREFUSED') > -1) {
    console.log('Connection to DB refused did you start it?')
  }

  if (err) {
    console.log(err)
  }
})

// Setup hooks
app.configure(hooks())

// Setup a rest interface
app.configure(rest())

// Parse JSON and form HTTP bodies
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Use the service object
app.use(`${BASE_URL}/recipe`, mongooseService({
  Model: Recipe
}))

// setup error handler
app.use(errorHandler())

app
  .service(`${BASE_URL}/recipe`)
  .before({
    create: [ validateSlug ],
    get: [ getBySlug ]
  })
  .after({
    all: [ mongooseService.hooks.toObject({}), convertDates ],
    get: [ hooks.remove('_id') ]
  })

export default app
