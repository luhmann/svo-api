import { dateToEpoch, dateFromEpoch } from '../lib/transformer.js'
import errors from 'feathers-errors'
import uniqueSlug from 'unique-slug'
import isArray from 'lodash/isArray'

export function convertDatesToEpoch (hook) {
  if (hook.result) {
    hook.result.created = dateToEpoch(hook.result.created)
    hook.result.modified = dateToEpoch(hook.result.modified)
    hook.result.published = dateToEpoch(hook.result.published)
  }
}

export function convertDatesFromEpoch (hook) {
  if (hook.data) {
    if (hook.data.created) {
      hook.data.created = dateFromEpoch(hook.data.created)
    }

    if (hook.data.modified) {
      hook.data.modified = dateFromEpoch(hook.data.modified)
    }

    if (hook.data.published) {
      hook.data.published = dateFromEpoch(hook.data.published)
    }
  }
}

export function validateSlug (hook) {
  return this
    .find({ slug: hook.data.slug })
    .then((docs) => {
      if (docs.length !== 0) {
        throw new errors.Conflict(`Duplicate Slug`, {
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
        } else {
          throw new errors.NotFound('Recipe does not exist')
        }
      })
  }
}

export function updateModified (hook) {
  hook.data.modified = new Date()
}

export function removePermanentFields (hook) {
  if (hook.data) {
    delete hook.data.created
  }
}
