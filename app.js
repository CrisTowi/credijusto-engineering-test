// Libraries
const express = require("express");
const app = express();

// Helper funcctions
const {
  getFixer,
  getDiarioOficial,
  getBanxico
} = require("./Helpers/helpers");

const {
  makeToken,
  validateExcess,
  tokenExist
} = require("./Helpers/token");

const {
  setAsync,
  delAsync,
  getAsync
} = require("./Helpers/redisClient");

// Clear cache endpoint
app.get("/clearCache", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // Clear redis keys
  delAsync("tokens");
  delAsync("rates");

  res.send(JSON.stringify({
    ok: true,
    token: "Cache cleared!"
  }));
});

// Generate a new token endpoint
app.get("/generateToken", async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // Get the IP as the user id
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // Generate the token
  const token = makeToken(ip);
  const cachedTokens = await getAsync("tokens");

  // Check if exists a list of tokens in the cache
  if (cachedTokens) {
    const tokens = JSON.parse(cachedTokens);

    // If there is a list of tokens and the token just generated exists then send a message to the client
    if (tokens && tokenExist(token, tokens)) {
      res.send(JSON.stringify({
        ok: true,
        token: "You already have a token"
      }));

      return;
    } else {
      // If the token does not exists then save the token in the cache and send it back to the client
      tokens.push({
        token: token,
        lastUsed: new Date(),
        generatedAt: new Date()
      });

      // Stores the token in the list of tokens
      setAsync("tokens", JSON.stringify(tokens));

      res.send(JSON.stringify({
        ok: true,
        token: token
      }));

      return;
    }
  } else {
    // If the list of tokens does not exists then starts the list with one token
    const tokens = [({
      token: token,
      lastUsed: new Date(),
      generatedAt: new Date()
    })];

    setAsync("tokens", JSON.stringify(tokens));

    res.send(JSON.stringify({
      ok: true,
      token: token
    }));

    return;
  }
});


// Main endpoint to get the exchange rates
app.get("/", async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  // First get the list of tokens on the cache
  const cachedTokens = await getAsync("tokens");
  const tokens = JSON.parse(cachedTokens);

  // If the token does not exists in the list then finish the request and send an answer to the user
  if (!tokens || !tokenExist(req.query.token, tokens)) {
    res.send(JSON.stringify({
      ok: false,
      message: "You need to have a valid token"
    }));
    return;
  }

  // Check if the clien has exceded the number of requests 1 per 3 seconds
  const { exceed, newTokens } = validateExcess(req.query.token, tokens);

  // Set the updated list of tokens
  setAsync("tokens", JSON.stringify(newTokens));

  if (exceed) {
    res.send(JSON.stringify({
      ok: false,
      message: "You have exceded the power of this token"
    }));
    return;
  }

  // Check if the data already exists in the cache and if exists then send it to the client
  const cachedData = await getAsync("rates");
  if (cachedData) {
    res.send(cachedData);
    return;
  }

  // If the data does not exists in the cache then get the data from different sources
  const result = {};
  result.fixer = await getFixer();
  result.diarioOficial = await getDiarioOficial();
  result.banxico = await getBanxico();

  // Stores the data in the cache with redis
  setAsync("rates", JSON.stringify(result));

  // Send the data to the client
  res.send(JSON.stringify(result));
});

app.listen(4000, () => {
  console.log(`Listening  4000`);
});