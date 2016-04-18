export function dateToEpoch (date) {
  return new Date(date).getTime()
}

export function dateFromEpoch (epoch) {
  return new Date(epoch).toISOString()
}
