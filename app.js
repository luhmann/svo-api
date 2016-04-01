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

import { BASE_URL, DB_URL } from './config/constants.js'
import Recipe from './model/RecipeModel.js'

const app = feathers()

// enable cors
app.use(cors())

mongoose.Promise = global.Promise
mongoose.connect(DB_URL, (err, connection) => {
  if (err && err.message.indexOf('ECONNREFUSED') > -1) {
    console.log('Connection to DB refused did you start it?')
  }

  console.log(err)
})

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

app.use((error, req, res, next) => {
  res.json(error)
})

app
  .service(`${BASE_URL}/recipe`)
  .before({
    create (hook) {
      hook.data.hash = uniqueSlug(hook.data.slug)
    },
    get (hook) {
      if (hook.id) {
        return this.find({ hash: uniqueSlug(hook.id) })
          .then(data => {
            if (isArray(data) && data.length === 1 && data[0].slug === hook.id) {
              hook.result = data[0]
              return hook
            }
          })
      }
    }
  })
  .after({
    get (hook) {
      let result = hook.result.toObject({ versionKey: false })
      delete result['_id']
      hook.result = result
    }
  })

export default app
