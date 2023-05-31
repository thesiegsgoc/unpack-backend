const { MongoClient } = require('mongodb');

const url = process.env.MONGODB_URL;
const client = new MongoClient(url);
const database = client.db('test');
const users = database.collection('users');
const orders = database.collection('orders');
const partners = database.collection('partners');
const deliveries = database.collection('deliveries');

module.exports = {
    users,
    orders,
    partners,
    deliveries
};