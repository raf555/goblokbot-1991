const express = require("express");
const app = express();
const bodyParser = require("body-parser");

/* line bot handler */
app.use(require("./chat.js"));

/* client configurations */
app.set("views", "./client/public");
app.set("view engine", "ejs");
app.set("view cache", true);
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

/* client-side */
app.use(require("./client"));

/* static files for client-side */
app.use(express.static("./client/public/static"));

/* admin operation */
// require("./service/admin")

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`listening on ${listener.address().port}`);
});
