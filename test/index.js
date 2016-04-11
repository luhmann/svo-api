import app from '../app.js'
import mongoose from 'mongoose'
import request from 'supertest'
import test from 'tape'

import { BASE_URL } from '../config/constants.js'
import { dropTestDb, loadFixtures } from './setup.js'
import goulash from './fixtures/goulash.json'

const before = (t) => {
  dropTestDb(t)
  loadFixtures()
}

const after = () => {
  mongoose.disconnect()
}

test('SVO Api', t => {
  before(t)

  t.test('GET single /recipe by slug', t => {
    request(app)
      .get(`${BASE_URL}/recipe/hungarian-goulash`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        t.error(err, 'No error')
        t.equal(res.body.slug, 'hungarian-goulash', 'Slug is as expected')
        t.notOk(res.body._id, 'id field was removed')
        t.end()
      })
  })

  t.test('POST single recipe', t => {
    dropTestDb(t)

    request(app)
      .post(`${BASE_URL}/recipe`)
      .send(goulash)
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) => {
        t.error(err, 'No error')
        t.ok(res.body._id, 'Id field exists')
        t.ok(res.body.created >= Date.now() - 1000, 'Created field was automatically generated with current datetime')
        t.ok(res.body.modified >= Date.now() - 1000, 'Modified field was automatically generated with current datetime')
        t.ok(res.body.published >= Date.now() - 1000, 'Created field was automatically generated with current datetime')
        t.ok(res.body.__v === 0, 'Version is zero')
        t.end()
        after()
      })
  })

  // t.test('PUT after POST', t => {
  //   let id
  //   dropTestDb(t)
  //
  //   request(app)
  //     .post(`${BASE_URL}/recipe`)
  //     .send(goulash)
  //     .end((err, res) => {
  //       t.error(err, 'No error')
  //       id = res.body._id
  //       t.end()
  //     })
  // })
})
