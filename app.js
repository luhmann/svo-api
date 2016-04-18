// @flow
import path from 'path'
import bodyParser from 'body-parser'
import cors from 'cors'
import compression from 'compression'
import feathers from 'feathers'
import configuration from 'feathers-configuration'
import hooks from 'feathers-hooks'
import mongooseService from 'feathers-mongoose'
import rest from 'feathers-rest'

import { BASE_URL } from './config/constants'
import Recipe from './model/Recipe'
import * as recipeHooks from './model/Recipe/hooks'
import middleware from './middleware'
import services from './services'
import authentication from 'feathers-authentication'
const auth = authentication.hooks

const app = feathers()

app.configure(configuration(path.join(__dirname, '.')))

// enable cors & activate compression
app
  .use(compression())
  .options('*', cors())
  .use(cors())

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
app.configure(services)
app.configure(middleware)

app
  .service(`${BASE_URL}/recipe`)
  .before({
    create: [ recipeHooks.convertDatesFromEpoch, recipeHooks.validateSlug ],
    get: [
      recipeHooks.getBySlug
    ],
    update: [ recipeHooks.convertDatesFromEpoch, recipeHooks.updateModified ],
    patch: hooks.disable()
  })
  .after({
    all: [ mongooseService.hooks.toObject({}), recipeHooks.convertDatesToEpoch ],
    get: [ hooks.remove('_id') ]
  })

export default app
