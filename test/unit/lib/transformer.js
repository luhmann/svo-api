import test from 'tape'
import mongoose from 'mongoose'

import { dateToUnix } from '../../../lib/transformer.js'

test('Lib: Transformer', t => {
  t.test('Mongoose date-object to unix timestamp', t => {
    t.ok(dateToUnix('2016-04-11T14:33:17.926Z') === 1460385197926, 'timestamps match')
    t.end()
    mongoose.disconnect()
  })
})
