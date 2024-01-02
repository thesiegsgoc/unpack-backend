"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const url = process.env.MONGODB_URL;
const client = new mongodb_1.MongoClient(url);
const database = client.db('test');
const users = database.collection('users');
const orders = database.collection('orders');
const zones = database.collection('zones');
const deliveries = database.collection('deliveries');
const drivers = database.collection('drivers');
const db = { users, orders, zones, deliveries, drivers };
exports.default = db;
