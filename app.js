const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const { getFixer, getDiarioOficial, getBanxico } = require("./Helpers/helpers");

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  const result = {};

  const fixer = await getFixer();
  result.fixer = fixer;
  
  const diarioOficial = await getDiarioOficial();
  result.diarioOficial = diarioOficial;

  const banxico = await getBanxico();
  result.banxico = banxico;

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(result));
});

app.listen(4000, () => {
  console.log(`Listening  4000`);
});
