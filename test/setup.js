import Recipe from '../model/RecipeModel.js'
import goulashFixture from './fixtures/goulash.json'

export const dropTestDb = () => {
  Recipe.remove((err, p) => {
    if (err) {
      throw err
    } else {
      console.log(`No Of Documents deleted: ${p}`)
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
