// @flow
'use strict'

import service from 'feathers-mongoose'
import recipe from './schemas/recipe'
import * as hooks from './hooks'
import { BASE_URL } from '../../config/constants'

const SERVICE_URL = `${BASE_URL}/recipes`

export default function () {
  const app = this

  const options = {
    Model: recipe,
    paginate: {
      default: 5,
      max: 25
    }
  }

  // Initialize our service with any options it requires
  app.use(SERVICE_URL, service(options))

  // Get our initialize service to that we can bind hooks
  const recipeService = app.service(SERVICE_URL)

  // Set up our before hooks
  recipeService.before(hooks.before)

  // Set up our after hooks
  recipeService.after(hooks.after)
}
