const db = require("./database");

function admingabut() {
  console.log("gabut")
  let a = db.open("db/latency.json")
  a.unset("c")
  a.save()
}

module.exports = admingabut;
