import { MongoClient } from 'mongodb'

const url = 'mongodb://localhost:27017'
const dbName = 'funboard'

const client = new MongoClient(url)
await client.connect()
const mongo = client.db(dbName)

export default mongo
