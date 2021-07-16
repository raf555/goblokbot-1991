const app = require("express").Router();

app.use(require("./router"));
app.use(require("./api"));
app.use(require("./misc"));

module.exports = app;
