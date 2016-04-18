import app from '../app.js'
import mongoose from 'mongoose'
import request from 'supertest'
import test from 'tape'
import isArray from 'lodash/isArray'
import cloneDeep from 'lodash/cloneDeep'

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
  t.test('General', t => {
    t.test('should indicate unknown routes', t => {
      request(app)
        .get('/non-existing')
        .expect('Content-Type', /json/)
        .expect(404)
        .end((err, res) => {
          t.error(err, 'No error')
          t.end()
        })
    })

    t.test('should return "method not allowed" for patch requests', t => {
      request(app)
        .patch(`${BASE_URL}/recipe/foo`)
        .expect('Content-Type', /json/)
        .expect(405)
        .end((err, res) => {
          t.error(err, 'No error')
          t.end()
        })
    })
  })

  t.test('GET', t => {
    before(t)

    t.test('should retrieve single /recipe by slug', t => {
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

    t.test('should indicate non-existing recipe', t => {
      request(app)
        .get(`${BASE_URL}/recipe/foo`)
        .expect('Content-Type', /json/)
        .expect(404)
        .end((err, res) => {
          t.error(err, 'No error')
          t.ok(res.body.message === 'Recipe does not exist', 'Error message as expected')
          t.end()
        })
    })

    t.test('find recipes by flat property', t => {
      request(app)
        .get(`${BASE_URL}/recipe/?category=dinner`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          t.error(err, 'No error')
          t.ok(isArray(res.body), 'Result is an array')
          t.ok(res.body.length === 1, 'the returned result has the correct length')
          t.end()
        })
    })
  })

  t.test('POST', t => {
    dropTestDb(t)

    t.test('should create new recipe with 201 CREATED', t => {
      request(app)
        .post(`${BASE_URL}/recipe`)
        .send(goulash)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          t.error(err, 'No error')
          t.ok(res.body._id, 'Id field exists')
          t.ok(res.body.hash === '3460f804', 'Hash has been inserted')
          t.ok(res.body.created >= Date.now() - 1000, 'Created field was automatically generated with current datetime')
          t.ok(res.body.modified >= Date.now() - 1000, 'Modified field was automatically generated with current datetime')
          t.ok(res.body.published >= Date.now() - 1000, 'Published field was automatically generated with current datetime')
          t.ok(res.body.__v === 0, 'Version is zero')
          t.end()
        })
    })

    t.test('should fail creating recipe with an existing slug', t => {
      request(app)
        .post(`${BASE_URL}/recipe`)
        .send(goulash)
        .expect('Content-Type', /json/)
        .expect(409)
        .end((err, res) => {
          t.error(err, 'No error')
          t.ok(res.body.name === 'Conflict', 'error name is as expected')
          t.ok(res.body.message === 'Duplicate Slug', 'error description is as expected')
          t.end()
        })
    })
  })

  t.test('PUT', t => {
    let id
    let newTitle = 'Foo Bar'

    dropTestDb(t)

    // set modified and published to old dats
    goulash.created = new Date('1995-12-17T03:24:00')
    goulash.published = new Date('1995-12-17T03:24:00')
    goulash.modified = new Date('1995-12-17T03:24:00')

    request(app)
      .post(`${BASE_URL}/recipe`)
      .send(goulash)
      .end((err, res) => {
        t.error(err, 'No error')
        id = res.body._id
        let goulashClone = cloneDeep(res.body)
        goulashClone.title = newTitle

        request(app)
          .put(`${BASE_URL}/recipe/${id}`)
          .send(goulashClone)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            t.error(err, 'No Error')
            t.ok(res.body.title === newTitle, 'Title successfully modified')
            t.ok(res.body.category === goulash.category, 'Category has not been modified')
            t.ok(res.body.created === 819170640000, 'Created field has been left untouched')
            t.ok(res.body.modified >= Date.now() - 1000, 'Modified field was automatically updated with current datetime')
            t.ok(res.body.published === 819170640000, 'Published field has been left untouched')
            t.end()
          })
      })
  })

  t.test('DELETE', t => {
    dropTestDb(t)
    t.test('should delete a single recipe', t => {
      let id
      request(app)
        .post(`${BASE_URL}/recipe`)
        .send(goulash)
        .end((err, res) => {
          t.error(err, 'No error')
          id = res.body._id

          request(app)
            .delete(`${BASE_URL}/recipe/${id}`)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              t.error(err, 'No Error')
              t.end()
              after()
            })
        })
    })
  })
})
