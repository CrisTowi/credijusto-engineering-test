const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const {
  getFixer,
  getDiarioOficial,
  getBanxico
} = require("./Helpers/helpers");

const redisClient = require("./Helpers/redisClient");

app.use(bodyParser.urlencoded({
  extended: false
}));

app.get("/", async (req, res) => {
  const cachedData = await redisClient.getAsync("test");
  if (cachedData) {
    res.setHeader("Content-Type", "application/json");
    res.send(cachedData);
    return;
  }

  const result = {};

  result.fixer = await getFixer();
  result.diarioOficial = await getDiarioOficial();
  result.banxico = await getBanxico();

  redisClient.setAsync("test", JSON.stringify(result));

  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(result));
});

app.listen(4000, () => {
  console.log(`Listening  4000`);
});
