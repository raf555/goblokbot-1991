const app = require("express").Router();
const line_login = require("line-login");
const session = require("express-session");
const db = require("./../service/database");
const hash = require("./../service/hash");

const session_options = {
  secret: process.env.login_secret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 24 * 3600 * 1000 }
};

const login = new line_login({
  channel_id: process.env.login_appid,
  channel_secret: process.env.login_secret,
  callback_url: process.env.login_callback,
  scope: "openid profile",
  //prompt: "consent",
  bot_prompt: "normal"
});

function makeq(query) {
  if (Object.keys(query).length > 0) {
    let out = "";
    for (let key in query) {
      let prefix;
      if (!out) {
        prefix = "?";
      } else {
        prefix = "&";
      }
      out += `${prefix}${key}=${query[key]}`;
    }
    return out;
  }
  return "";
}

async function isloggedin(req, res, next) {
  try {
    let data = await login.verify_access_token(req.session.acc_token);
    next();
  } catch (e) {
    req.session.redir = req.path + makeq(req.query);
    res.redirect("/auth/login");
  }
}

app.use(session(session_options));

app.use("/auth/login", login.auth());

app.use(
  "/auth/callback",
  login.callback(
    (req, res, next, token_response) => {
      let userdb = db.open("db/user.json");
      if (!userdb.get(hash(token_response.id_token.sub))) {
        res.sendStatus(403);
        return;
      }
      req.session.acc_token = token_response.access_token;
      req.session.uid = token_response.id_token.sub;
      req.session.mis = token_response.id_token;
      if (req.session.redir && req.session.redir != "/") {
        let redir = req.session.redir;
        req.session.redir = "/";
        res.redirect(redir);
      } else {
        res.redirect("/");
      }
    },
    (req, res, next, error) => {
      res.redirect("/");
      //res.sendStatus(403);
    }
  )
);

app.get("/auth/logout", isloggedin, function(req, res) {
  login.revoke_access_token(req.session.acc_token).then(() => {
    req.session.destroy();
    res.redirect("/auth/login");
  });
});

module.exports = { app: app, isloggedin: isloggedin };
