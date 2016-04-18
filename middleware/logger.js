'use strict'

import winston from 'winston'

const DEBUG = true

export default function (app) {
  // Add a logger to our app object for convenience
  app.logger = winston

  return function (error, req, res, next) {
    if (error) {
      const message = `${error.code ? `(${error.code}) ` : '' }Route: ${req.url} - ${error.message}`

      if (error.code === 404) {
        winston.info(message)
      } else {
        winston.error(message)
        winston.info(error.stack)
      }
    }

    if (DEBUG) {
      winston.info(`${req.method} to "${req.url}" with`, req.body)
    }

    next(error)
  }
}
