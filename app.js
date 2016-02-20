// @flow
import bodyParser from 'body-parser'
import cors from 'cors'
import feathers from 'feathers'
import hooks from 'feathers-hooks'
import { isArray } from 'lodash'
import mongoose from 'mongoose'
import mongooseService from 'feathers-mongoose'
import rest from 'feathers-rest'
import uniqueSlug from 'unique-slug'

import Recipe from './model/RecipeModel.js'

const app = feathers()
const prefix = 'api/v1'

// enable cors
app.use(cors())

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/svo', (err, connection) => {
  if (err) {
    throw err
  }
})

app.configure(hooks())

// Setup a rest interface
app.configure(rest())

// Parse JSON and form HTTP bodies
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Use the service object
app.use(`${prefix}/recipe`, mongooseService({
  Model: Recipe
}))

app.use((error, req, res, next) => {
  res.json(error)
})

app
  .service(`${prefix}/recipe`)
  .before({
    create (hook) {
      hook.data.hash = uniqueSlug(hook.data.slug)
    },
    get (hook) {
      if (hook.id) {
        return this.find({ hash: uniqueSlug(hook.id) })
          .then(data => {
            if (isArray(data) && data.length === 1 && data[0].slug === hook.id) {
              let result = data[0].toObject({ versionKey: false })
              delete result['_id']
              hook.result = result
              return hook
            }
          })
      }
    }
  })
  // .after({
  //   get: (hook, next) => {
  //     // console.log(hook.result)
  //   }
  // })

// Start the application on port 3030
app.listen(3030, () => {
  console.log('SVO API is now listening on port 3030')
})
