const express = require("express");
const app = express();

/* scheduled job */
require("./service/cron")();

/* line bot handler */
app.use(require("./chat.js"));

/* client configurations */
app.set("view engine", "ejs");
app.set("view cache", true);
app.set("views", "./web/public");
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

/* static files for client-side */
app.use(express.static("./web/public/static"));

/* client-side */
app.use(require("./web"));

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`listening on ${listener.address().port}`);
});
