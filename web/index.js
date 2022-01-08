const app = require("express").Router();
const auth = require("./auth");
const RateLimit = require("express-rate-limit");

/* limiter for web requests */
app.use(
  RateLimit({
    max: 3600, // limit each IP to 3600 requests per 60 seconds
    delayMs: 0 // disable delaying - full speed until the max limit is reached
  })
);

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
