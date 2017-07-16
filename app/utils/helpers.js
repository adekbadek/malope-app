import { compose, map, values } from 'ramda'

export const mapObject = compose(values, map)

export const hashCode = str => {
  return str.split('').reduce((prevHash, currVal) => ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0)
}
