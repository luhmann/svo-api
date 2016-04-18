import test from 'tape'
import mongoose from 'mongoose'

import { dateToEpoch, dateFromEpoch } from '../../../lib/transformer.js'

test('Lib: Transformer', t => {
  t.test('Mongoose date-object to unix timestamp', t => {
    t.ok(dateToEpoch('2016-04-11T14:33:17.926Z') === 1460385197926, 'timestamps match')
    t.end()
  })

  t.test('Unix timestamp to javascript date object', t => {
    t.ok(dateFromEpoch(1460385197926) === '2016-04-11T14:33:17.926Z', 'timestamps match')
    t.end()
    mongoose.disconnect()
  })
})
