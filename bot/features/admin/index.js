const fs = require("fs");
const { isAdmin } = require("./../../utility");

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
      list[name] = adminonly(require("./" + name));
    } else {
      list[name] = 1;
    }
  });

  return list;
}

function adminonly(func) {
  return (parsed, event) => {
    if (!isAdmin(event.source.userId)) {
      return null;
    }
    return func(parsed, event);
  };
}
