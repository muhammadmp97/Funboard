import mongodb from '../clients/mongodb.js'

const getAll = async function () {
  return mongodb
    .collection('games')
    .find({ isLive: true })
    .toArray()
}

export { getAll }
