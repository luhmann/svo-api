import app from '../app.js'
import mongoose from 'mongoose'
import request from 'supertest'
import test from 'tape'
import isArray from 'lodash/isArray'
import cloneDeep from 'lodash/cloneDeep'

import { BASE_URL } from '../config/constants.js'
import { dropTestDb, loadFixtures, deleteTestUser } from './setup.js'
import goulash from './fixtures/goulash.json'
import userMock from './fixtures/user.json'

let token
let server

const AUTH_HEADER_NAME = 'authorization'

const before = (t) => {
  dropTestDb(t)
  loadFixtures()
}

const after = () => {
  server.close()
  mongoose.disconnect()
}

test('SVO Api', t => {
  t.test('Before', t => {
    server = app.listen(3030, () => {
      deleteTestUser(t)
      before(t)
      request(app)
        .post(`${BASE_URL}/users`)
        .send(userMock)
        .expect(201)
        .end((err, res) => {
          if (err) {
            t.fail('User could not be generated', err)
            t.end()
          } else {
            request(app)
              .post('/auth/local')
              .send(userMock)
              .end((err, res) => {
                if (err) {
                  t.fail('token could not be received', err)
                } else {
                  token = res.body.token
                  t.comment(`Received token ${token}`)
                }
                t.end()
              })
          }
        })
    })
  })

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
        .patch(`${BASE_URL}/recipes/foo`)
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

    // TODO: test unauthenticated

    t.test('should retrieve single recipe by slug', t => {
      request(app)
        .get(`${BASE_URL}/recipes/hungarian-goulash`)
        .set(AUTH_HEADER_NAME, token)
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
        .get(`${BASE_URL}/recipes/foo`)
        .set(AUTH_HEADER_NAME, token)
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
        .get(`${BASE_URL}/recipes/?category=dinner`)
        .set(AUTH_HEADER_NAME, token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          t.error(err, 'No error')
          t.ok(res.body.total === 1, 'has the correct number of results')
          t.ok(isArray(res.body.data), 'Result is an array')
          t.ok(res.body.data.length === 1, 'the returned result has the correct length')
          t.end()
        })
    })
  })

  t.test('POST', t => {
    dropTestDb(t)

    t.test('should create new recipe with 201 CREATED', t => {
      goulash.created = new Date('1995-12-17T03:24:00')

      request(app)
        .post(`${BASE_URL}/recipes`)
        .send(goulash)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          t.error(err, 'No error')
          t.ok(res.body._id, 'Id field exists')
          t.ok(res.body.hash === '3460f804', 'Hash has been inserted')
          t.ok(res.body.created >= Date.now() - 1000, 'Created field was automatically set the provided value was ignored')
          t.ok(res.body.modified >= Date.now() - 1000, 'Modified field was automatically generated with current datetime')
          t.ok(res.body.published >= Date.now() - 1000, 'Published field was automatically generated with current datetime')
          t.ok(res.body.__v === 0, 'Version is zero')
          t.end()
        })
    })

    t.test('should fail creating recipe with an existing slug', t => {
      request(app)
        .post(`${BASE_URL}/recipes`)
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
    let created
    let newTitle = 'Foo Bar'

    dropTestDb(t)

    // set modified and published to old dats
    goulash.created = new Date('1995-12-17T03:24:00')
    goulash.published = new Date('1995-12-17T03:24:00')
    goulash.modified = new Date('1995-12-17T03:24:00')

    request(app)
      .post(`${BASE_URL}/recipes`)
      .send(goulash)
      .end((err, res) => {
        t.error(err, 'No error')
        id = res.body._id
        created = res.body.created
        let goulashClone = cloneDeep(res.body)
        goulashClone.title = newTitle

        request(app)
          .put(`${BASE_URL}/recipes/${id}`)
          .send(goulashClone)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            t.error(err, 'No Error')
            t.ok(res.body.title === newTitle, 'Title successfully modified')
            t.ok(res.body.category === goulash.category, 'Category has not been modified')
            t.ok(res.body.created === created, 'Created field has been left untouched')
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
        .post(`${BASE_URL}/recipes`)
        .send(goulash)
        .end((err, res) => {
          t.error(err, 'No error')
          id = res.body._id

          request(app)
            .delete(`${BASE_URL}/recipes/${id}`)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              t.error(err, 'No Error')
              t.end()
            })
        })
    })
  })

  t.test('After', t => {
    after()
    t.end()
  })
})
