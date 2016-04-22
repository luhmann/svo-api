import app from '../app.js'
import mongoose from 'mongoose'
import request from 'supertest'
import test from 'tape'
import isArray from 'lodash/isArray'
import cloneDeep from 'lodash/cloneDeep'
import pick from 'lodash/pick'

import {
  BASE_URL
} from '../config/constants.js'
import {
  dropTestDb,
  loadFixtures,
  deleteTestUser
} from './setup.js'
import goulash from './fixtures/recipe/goulash.json'
import userMock from './fixtures/user/user.json'
import adminMock from './fixtures/user/admin.json'

let userToken
let adminToken
let server

const AUTH_HEADER_NAME = 'x-authorization'

const before = (t) => {
  dropTestDb(t)
  loadFixtures()
}

const after = () => {
  server.close()
  mongoose.disconnect()
}

test('SVO Api', t => {
  // TODO: get rid of this callback-hell willya?
  t.test('Before: Create user with "read"-role', t => {
    // Bootstrap the real app
    server = app.listen(3030, () => {
      deleteTestUser(t)
      before(t)

      // Get a token with read privileges
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
              .post(`${BASE_URL}/auth/local`)
              .send(pick(userMock, 'email', 'password'))
              .end((err, res) => {
                if (err) {
                  t.fail('userToken could not be received', err)
                } else {
                  userToken = res.body.token
                  t.comment(`Received userToken ${userToken}`)
                  t.end()
                }
              })
          }
        })
    })
  })

  t.test('Before: Create user with "write"-role', t => {
    // Get a token with write privileges
    request(app)
      .post(`${BASE_URL}/users`)
      .send(adminMock)
      .expect(201)
      .end((err, res) => {
        if (err) {
          t.fail('Admin could not be generated', err)
          t.end()
        } else {
          request(app)
            .post(`${BASE_URL}/auth/local`)
            .send(pick(adminMock, 'email', 'password'))
            .end((err, res) => {
              if (err) {
                t.fail('adminToken could not be received', err)
              } else {
                adminToken = res.body.token
                t.comment(`Received adminToken ${adminToken}`)
                t.end()
              }
            })
        }
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
        .set(AUTH_HEADER_NAME, userToken)
        .expect('Content-Type', /json/)
        .expect(405)
        .end((err, res) => {
          t.error(err, 'No error')
          t.end()
        })
    })
  })

  t.test('Authentication & Authorization', t => {
    before(t)

    t.test('should reject requests with missing authorization token', t => {
      request(app)
        .get(`${BASE_URL}/recipes/hungarian-goulash`)
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          t.error(err, 'No error')
          t.end()
        })
    })

    // TODO: test with expired authorization userToken
    // TODO: test with insufficient permission
  })

  t.test('GET', t => {
    before(t)

    t.test('should retrieve single recipe by slug', t => {
      request(app)
        .get(`${BASE_URL}/recipes/hungarian-goulash`)
        .set(AUTH_HEADER_NAME, userToken)
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
        .set(AUTH_HEADER_NAME, userToken)
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
        .set(AUTH_HEADER_NAME, userToken)
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
        .set(AUTH_HEADER_NAME, adminToken)
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
        .set(AUTH_HEADER_NAME, adminToken)
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

    t.test('should fail creating recipe when authentication token has insufficient permissions "403"', t => {
      request(app)
        .post(`${BASE_URL}/recipes`)
        .set(AUTH_HEADER_NAME, userToken)
        .send(goulash)
        .expect('Content-Type', /json/)
        .expect(403)
        .end((err, res) => {
          t.error(err, 'No error')
          t.end()
        })
    })

    t.test('should fail creating recipe when authentication token is missing "401"', t => {
      request(app)
        .post(`${BASE_URL}/recipes`)
        .send(goulash)
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          t.error(err, 'No error')
          t.end()
        })
    })

    // TODO: tests for mongoose data validation
  })

  t.test('PUT', t => {
    let id

    t.test('modify a simple recipe with 200', t => {
      let created
      let newTitle = 'Foo Bar'

      dropTestDb(t)

      goulash.created = new Date('1995-12-17T03:24:00')
      goulash.published = new Date('1995-12-17T03:24:00')
      goulash.modified = new Date('1995-12-17T03:24:00')

      request(app)
        .post(`${BASE_URL}/recipes`)
        .set(AUTH_HEADER_NAME, adminToken)
        .send(goulash)
        .end((err, res) => {
          t.error(err, 'No error')
          id = res.body._id
          created = res.body.created
          let goulashClone = cloneDeep(res.body)
          goulashClone.title = newTitle

          request(app)
            .put(`${BASE_URL}/recipes/${id}`)
            .set(AUTH_HEADER_NAME, adminToken)
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

    t.test('should fail to modify a recipe when a token with insufficient permissions is passed with "403"', t => {
      request(app)
        .put(`${BASE_URL}/recipes/${id}`)
        .set(AUTH_HEADER_NAME, userToken)
        .send(goulash)
        .expect('Content-Type', /json/)
        .expect(403)
        .end((err, res) => {
          t.error(err, 'No Error')
          t.end()
        })
    })

    t.test('should fail to modify a recipe when no authentication token is passed with "401"', t => {
      request(app)
        .put(`${BASE_URL}/recipes/${id}`)
        .send(goulash)
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          t.error(err, 'No Error')
          t.end()
        })
    })

      // TODO: Test put for non-existing recipe
  })

  t.test('DELETE', t => {
    dropTestDb(t)

    t.test('should fail with "401" when no user token is supplied', t => {
      let id
      request(app)
        .post(`${BASE_URL}/recipes`)
        .set(AUTH_HEADER_NAME, adminToken)
        .send(goulash)
        .end((err, res) => {
          t.error(err, 'No error')
          id = res.body._id

          request(app)
            .delete(`${BASE_URL}/recipes/${id}`)
            .expect('Content-Type', /json/)
            .expect(401)
            .end((err, res) => {
              t.error(err, 'No Error')
              dropTestDb(t)
              t.end()
            })
        })
    })

    t.test('should fail with "403" when token has insufficient permissions', t => {
      let id
      request(app)
        .post(`${BASE_URL}/recipes`)
        .set(AUTH_HEADER_NAME, adminToken)
        .send(goulash)
        .end((err, res) => {
          t.error(err, 'No error')
          id = res.body._id

          request(app)
            .delete(`${BASE_URL}/recipes/${id}`)
            .set(AUTH_HEADER_NAME, userToken)
            .expect('Content-Type', /json/)
            .expect(403)
            .end((err, res) => {
              t.error(err, 'No Error')
              dropTestDb(t)
              t.end()
            })
        })
    })

    t.test('should delete a single recipe with "200"', t => {
      let id
      request(app)
        .post(`${BASE_URL}/recipes`)
        .set(AUTH_HEADER_NAME, adminToken)
        .send(goulash)
        .end((err, res) => {
          t.error(err, 'No error')
          id = res.body._id

          request(app)
            .delete(`${BASE_URL}/recipes/${id}`)
            .set(AUTH_HEADER_NAME, adminToken)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              t.error(err, 'No Error')
              t.end()
            })
        })
    })

    // TODO: test delete for non existing recipe
  })

  t.test('After', t => {
    after()
    t.end()
  })
})
