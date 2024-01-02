import { MongoClient } from 'mongodb'

const url = process.env.MONGODB_URL!
const client = new MongoClient(url)
const database = client.db('test')

const users = database.collection('users')
const orders = database.collection('orders')
const zones = database.collection('zones')
const deliveries = database.collection('deliveries')
const drivers = database.collection('drivers')

const db = { users, orders, zones, deliveries, drivers }

export default db
