const app = require("express").Router();
const { line, config } = require("./service/line");

const bot = require("./bot");

app.post("/chat/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(bot.handleEvent))
    .then(result => res.json(result))
    .catch(e => {
      console.log(e);
    });
});

module.exports = app;
