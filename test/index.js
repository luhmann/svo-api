import app from '../app.js'
import mongoose from 'mongoose'
import request from 'supertest'
import test from 'tape'

import { BASE_URL } from '../config/constants.js'

const afterEach = () => {
  mongoose.disconnect()
}

test('SVO Api', t => {
  t.test('GET single recipe recipe/hungarian-goulash', t => {
    request(app)
      .get(`${BASE_URL}/recipe/hungarian-goulash`)
      .expect(200)
      .end((err, res) => {
        t.error(err, 'No error')
        t.equal(res.body.slug, 'hungarian-goulash', 'Slug is as expected')
        t.end()
        afterEach()
      })
  })
})
