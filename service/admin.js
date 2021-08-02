const db = require("./database");

function admingabut() {
  let a = db.open("db/cmdhistory.json")
  a.unset("87")
  a.save()
  console.log("ok")
}

module.exports = admingabut;
