const fs = require("fs");

module.exports = getfeatures;

function getfeatures(onlyname = false) {
  const condition = name => {
    return name !== "index";
  };

  let list = {};

  let features = fs
    .readdirSync(__dirname)
    .map(name => {
      return name.replace(".js", "");
    })
    .filter(name => {
      return condition(name);
    });

  features.forEach(name => {
    if (!onlyname) {
      list[name] = require("./" + name);
    } else {
      list[name] = 1;
    }
  });

  return list;
}
