export const PREFIX = 'api'
export const VERSION = 'v1'
export const BASE_URL = `/${PREFIX}/${VERSION}`
export const DB_URL =
  (process.env.NODE_ENV === 'TEST')
    ? 'mongodb://127.0.0.1:27017/svo-test'
    : 'mongodb://127.0.0.1:27017/svo'
