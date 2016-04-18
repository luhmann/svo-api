import Recipe from '../model/Recipe'
import goulashFixture from './fixtures/goulash.json'

export const dropTestDb = (t) => {
  Recipe.remove((err, p) => {
    if (err) {
      throw err
    } else {
      t.comment(`Before: No Of Documents deleted: ${p}`)
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
