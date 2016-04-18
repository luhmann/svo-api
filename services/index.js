// @flow
'use strict'
import authentication from './authentication'
import user from './user'
import mongoose from 'mongoose'

export default function () {
  const app = this

  mongoose.connect(app.get('mongodb'), (err, connection) => {
    if (err && err.message.indexOf('ECONNREFUSED') > -1) {
      console.log('Connection to DB refused did you start it?')
    }

    if (err) {
      console.log(err)
    }
  })
  mongoose.Promise = global.Promise

  app.configure(authentication)
  app.configure(user)
}
