import { dateToUnix } from '../lib/transformer.js'
import errors from 'feathers-errors'
import uniqueSlug from 'unique-slug'
import isArray from 'lodash/isArray'

export function convertDates (hook) {
  hook.result.created = dateToUnix(hook.result.created)
  hook.result.modified = dateToUnix(hook.result.modified)
  hook.result.published = dateToUnix(hook.result.published)
}

export function validateSlug (hook) {
  return this
    .find({ slug: hook.data.slug })
    .then((docs) => {
      if (docs.length !== 0) {
        throw new errors.BadRequest(`Invalid request`, {
          errors: [ {
            message: `Entry with slug "${hook.data.slug}" already exists`
          } ]
        })
      }

      hook.data.hash = uniqueSlug(hook.data.slug)
      return hook
    })
}

export function getBySlug (hook) {
  if (hook.id) {
    return this
      .find({ hash: uniqueSlug(hook.id) })
      .then(data => {
        if (isArray(data) && data.length === 1 && data[0].slug === hook.id) {
          hook.result = data[0]
          return hook
        }
      })
  }
}
