const app = require("express").Router();
const auth = require("./auth");

/* misc, personal stuffs */
app.use(require("./misc"));

/* other routes that doesn't require auth */
app.use(require("./routes2"));

/* must auth to use */
app.use(auth.app);
app.use("/api", require("./api"));
app.use(auth.isloggedin);
app.use(require("./routes"));

/* 404 handler */
app.use((req, res) => {
  res.status(404).redirect("/");
});

module.exports = app;
