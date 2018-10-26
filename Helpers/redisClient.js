// Libraries
const redis = require("redis");
const { promisify } = require("util");

// Create client object
const client = redis.createClient(process.env.REDIS_URL);

// Return all the functions from redis promisified to make sure we can use them like promises
module.exports = {
  ...client,
  getAsync: promisify(client.get).bind(client),
  setAsync: promisify(client.set).bind(client),
  delAsync: promisify(client.del).bind(client)
};
