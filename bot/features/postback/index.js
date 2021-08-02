const fs = require("fs")

module.exports = function (onlyname = false) {
  const condition = name => {
    return name !== "index";
  };

  let list = {};

  let features = fs
    .readdirSync(__dirname)
    .map(name => name.replace(".js", ""))
    .filter(name => condition(name));

  features.forEach(name => {
    if (!onlyname) {
      list[name] = require("./" + name);
    } else {
      list[name] = 1;
    }
  });

  return list;
}
