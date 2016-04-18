// @flow
import path from 'path'
import bodyParser from 'body-parser'
import cors from 'cors'
import compression from 'compression'
import feathers from 'feathers'
import configuration from 'feathers-configuration'
import hooks from 'feathers-hooks'
import rest from 'feathers-rest'
import middleware from './middleware'
import services from './services'

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
app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))

// configure middleware & services
app
  .configure(services)
  .configure(middleware)

export default app
