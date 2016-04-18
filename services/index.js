// @flow
'use strict'
import authentication from './authentication'
import user from './user'
import recipe from './recipe'
import mongoose from 'mongoose'

export default function () {
  const app = this

  mongoose.Promise = global.Promise
  mongoose.connect(app.get('mongodb'), (err, connection) => {
    if (err && err.message.indexOf('ECONNREFUSED') > -1) {
      console.log('Connection to DB refused did you start it?')
    }

    if (err) {
      console.log(err)
    }
  })

  app.configure(authentication)
  app.configure(user)
  app.configure(recipe)
}
