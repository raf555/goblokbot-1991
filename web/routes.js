const app = require("express").Router();
const fs = require("fs");
const db = require("./../service/database");
const hash = require("./../service/hash");
const { cekban, isAdmin, convertTZ } = require("./../bot/utility");

app.get("/", index);
app.get("/latency", latency);
app.get("/chat/img", chatimg);
app.get("/chat", chat);
app.get("/command", command);
app.get("/command/img", commandimg);
app.get("/user", user);
app.get("/user/:userid", getuser);

function index(req, res) {
  let state = db.open("bot/setting.json");
  res.render("index", {
    items: req.session.mis,
    uid: hash(req.session.uid),
    state: state.get(),
    admin: isAdmin(req.session.uid),
    ban: cekban(hash(req.session.uid))
  });
}

function latency(req, res) {
  res.render("latency", {
    items: req.session.mis,
    admin: isAdmin(req.session.uid),
    cmd: req.query.cmd
  });
}

function chatimg(req, res) {
  let a = convertTZ(new Date(), "Asia/Jakarta");
  let date = convertTZ(
    new Date(`${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}`),
    "Asia/Jakarta"
  ).getTime();

  if (req.query.date) {
    date = req.query.date;
  }
  let temlendb = db.open("db/chat/history/" + date + ".json");
  let imgdb = db.open("db/chat/chatimg.json");
  let files = fs.readdirSync(__dirname + "/../db/chat/history");

  res.render("chatimg", {
    items: req.session.mis,
    admin: isAdmin(req.session.uid),
    chat: !files.includes(date + ".json") ? {} : temlendb.get(),
    imgdb: imgdb.get(),
    date: files,
    user: db.open("db/user.json").get(),
    q: date
  });
}

function chat(req, res) {
  let files = fs.readdirSync(__dirname + "/../db/chat/history");

  let a = convertTZ(new Date(), "Asia/Jakarta");
  let date = convertTZ(
    new Date(`${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}`),
    "Asia/Jakarta"
  ).getTime();

  if (req.query.date) {
    date = req.query.date;
  }
  let temlendb = db.open("db/chat/history/" + date + ".json");
  res.render("chat", {
    items: req.session.mis,
    admin: isAdmin(req.session.uid),
    chat: !files.includes(date + ".json") ? {} : temlendb.get(),
    date: files,
    user: db.open("db/user.json").get(),
    q: date
  });
}

function command(req, res) {
  let cmddb = db.open("db/customcmd.json");
  let latdb = db.open("db/latency.json");
  res.render("command", {
    items: req.session.mis,
    admin: isAdmin(req.session.uid),
    cmd: cmddb.get(),
    lat: latdb.get(),
    yourid: hash(req.session.uid)
  });
}

function commandimg(req, res) {
  if (!isAdmin(req.session.uid)) {
    res.redirect("/");
  }
  let cmddb = db.open("db/customcmd.json");
  let cmdimgdb = db.open("db/featureimg.json");
  res.render("fiturimg", {
    items: req.session.mis,
    admin: isAdmin(req.session.uid),
    imgdb: cmdimgdb.get(),
    cmddb: cmddb.get()
  });
}

function user(req, res) {
  var user = db.open("db/user.json");
  var list = {};
  for (var i = 0; i < Object.keys(user.get()).length; i++) {
    if (cekban(Object.keys(user.get())[i])[0]) {
      list[user.get(Object.keys(user.get())[i] + ".name")] = {
        ban: 1,
        dur: cekban(Object.keys(user.get())[i])[1],
        durt: cekban(Object.keys(user.get())[i])[2],
        id: Object.keys(user.get())[i]
      };
    } else {
      list[user.get(Object.keys(user.get())[i] + ".name")] = {
        ban: 0,
        dur: cekban(Object.keys(user.get())[i])[1],
        durt: cekban(Object.keys(user.get())[i])[2],
        id: Object.keys(user.get())[i]
      };
    }
  }
  //console.log(list)
  res.render("user", {
    items: req.session.mis,
    admin: isAdmin(req.session.uid),
    user: list
  });
}

function getuser(req, res) {
  let userdb = db.open("db/user.json");
  if (req.params.userid == "me") {
    res.redirect("/user/" + hash(req.session.uid));
  } else {
    if (!userdb.get(req.params.userid)) {
      res.redirect("/");
    } else {
      res.render("users", {
        userdata: userdb.get(req.params.userid),
        aidi: req.params.userid,
        admin: isAdmin(req.session.uid),
        isadmin: isAdmin(req.params.userid, true),
        ban: cekban(req.params.userid)
      });
    }
  }
}

module.exports = app;
