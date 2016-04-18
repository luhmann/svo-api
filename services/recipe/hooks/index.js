// @flow
import { dateToEpoch, dateFromEpoch } from '../../../lib/transformer.js'
import errors from 'feathers-errors'
import uniqueSlug from 'unique-slug'
import isArray from 'lodash/isArray'
import hooks from 'feathers-hooks'
import mongooseService from 'feathers-mongoose'

function convertDatesToEpoch (hook) {
  if (!isArray(hook.result.data)) {
    hook.result.created = dateToEpoch(hook.result.created)
    hook.result.modified = dateToEpoch(hook.result.modified)
    hook.result.published = dateToEpoch(hook.result.published)
  }
}

function convertDatesFromEpoch (hook) {
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

function validateSlug (hook) {
  return this
    .find({
      query: { slug: hook.data.slug }
    })
    .then((docs) => {
      if (docs.total !== 0) {
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

function getBySlug (hook) {
  if (hook.id) {
    return this
      .find({
        query: { hash: uniqueSlug(hook.id) }
      })
      .then((res) => {
        if (res.total === 0) {
          throw new errors.NotFound('Recipe does not exist')
        }

        if (res.total === 1 && res.data[0].slug === hook.id) {
          hook.result = res.data[0]
          return hook
        }

        if (res.total > 1) {
          throw new errors.GeneralError('Unavailable')
        }
      })
  }
}

function updateModified (hook) {
  hook.data.modified = new Date()
}

function removePermanentFields (hook) {
  if (hook.data) {
    delete hook.data.created
  }
}

export const before = {
  create: [ validateSlug, convertDatesFromEpoch, removePermanentFields ],
  get: [ getBySlug ],
  update: [ convertDatesFromEpoch, updateModified ],
  patch: hooks.disable()
}

export const after = {
  all: [ mongooseService.hooks.toObject({}), convertDatesToEpoch ],
  get: [ hooks.remove('_id') ]
}
