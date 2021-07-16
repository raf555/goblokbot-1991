const app = require("express").Router({ caseSensitive: true });

app.get("/goblok", function(req, res) {
  res.send({ res: true });
});

app.get("/tes", function(req, res) {
  res.send(200);
});

module.exports = app;
