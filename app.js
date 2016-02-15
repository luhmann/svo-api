// @flow
import bodyParser from 'body-parser'
import cors from 'cors'
import crypto from 'crypto'
import feathers from 'feathers'
import hooks from 'feathers-hooks'
import mongodb from 'feathers-mongodb'

const app = feathers()
const prefix = 'api/v1'

// enable cors
app.use(cors())

let recipeService = mongodb({
  host: '127.0.0.1',
  db: 'svo',
  collection: 'recipes'
})

app.configure(hooks())

// Setup a rest interface
app.configure(feathers.rest())

// Parse JSON and form HTTP bodies
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Use the service object
app.use(`${prefix}/recipe`, recipeService)

app
  .service(`${prefix}/recipe`)
  .before({
    create: (hook, next) => {
      hook.data.createdAt = new Date()
      next()
    }
  })

// Start the application on port 3030
app.listen(3030)
