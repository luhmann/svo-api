// @flow
import bodyParser from 'body-parser'
import cors from 'cors'
import feathers from 'feathers'
import mongodb from 'feathers-mongodb'

const app = feathers()
// enable cors
app.use(cors())

let recipeService = mongodb({
  host: '127.0.0.1',
  db: 'svo',
  collection: 'recipes'
})

// Setup a rest interface
app.configure(feathers.rest())

// Parse JSON and form HTTP bodies
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Use the service object
app.use('/api/v1/recipe', recipeService)

// Start the application on port 3030
app.listen(3030)
