// @flow
import Recipe from '../services/recipe/schemas/recipe'
import User from '../services/user/model'
import goulashFixture from './fixtures/recipe/goulash.json'

export const dropTestDb = (t) => {
  Recipe.remove((err, p) => {
    if (err) {
      throw err
    } else {
      t.comment(`Before: No Of Recipes deleted: ${p}`)
    }
  })
}

export const loadFixtures = () => {
  let goulash = new Recipe(goulashFixture)

  goulash.save((err) => {
    if (err) {
      console.log(err)
    }
  })
}

export const deleteTestUser = (t) => {
  User.remove((err, p) => {
    if (err) {
      throw err
    } else {
      t.comment(`Before: No Of Users deleted: ${p}`)
    }
  })
}
