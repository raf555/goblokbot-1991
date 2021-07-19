const express = require("express");
const app = express();
const bodyParser = require("body-parser");

/* scheduled job */
require("./service/cron")();

/* line bot handler */
app.use(require("./chat.js"));

/* client configurations */
app.set("views", "./web/public");
app.set("view engine", "ejs");
app.set("view cache", true);
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

/* static files for client-side */
app.use(express.static("./web/public/static"));

/* client-side */
app.use(require("./web"));

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`listening on ${listener.address().port}`);
});
