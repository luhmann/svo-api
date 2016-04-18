// @flow
'use strict'

import service from 'feathers-mongoose'
import user from './model'
import * as hooks from './hooks'
import { BASE_URL } from '../../config/constants'

const SERVICE_URL = `${BASE_URL}/users`

export default function () {
  const app = this

  const options = {
    Model: user,
    paginate: {
      default: 5,
      max: 25
    }
  }

  // Initialize our service with any options it requires
  app.use(SERVICE_URL, service(options))

  // Get our initialize service to that we can bind hooks
  const userService = app.service(SERVICE_URL)

  // Set up our before hooks
  userService.before(hooks.before)

  // Set up our after hooks
  userService.after(hooks.after)
}
