import errorHandler from 'feathers-errors/handler'
import notFound from './not-found-handler'
import logger from './logger'

export default function () {
  const app = this

  // handle invalid routes
  app.use(notFound())
  // configure logging
  app.use(logger(app))
  // configure real errors
  app.use(errorHandler())
}
