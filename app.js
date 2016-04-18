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
import * as customHooks from './config/hooks.js'
import middleware from './middleware'

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

// configure middleware
app.configure(middleware)

app
  .service(`${BASE_URL}/recipe`)
  .before({
    create: [ customHooks.convertDatesFromEpoch, customHooks.validateSlug ],
    get: [ customHooks.getBySlug ],
    update: [ customHooks.convertDatesFromEpoch, customHooks.updateModified ],
    patch: hooks.disable()
  })
  .after({
    all: [ mongooseService.hooks.toObject({}), customHooks.convertDatesToEpoch ],
    get: [ hooks.remove('_id') ]
  })

export default app
