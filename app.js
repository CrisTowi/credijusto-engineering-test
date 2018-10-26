const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  res.send("Hello World")
});

app.listen(4000, () => {
  console.log(`Listening  4000`);
});
