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
    .map(name => name.replace(".js", ""))
    .filter(name => condition(name));

  features.forEach(name => {
    let { data, run } = require("./" + name);
    if (!onlyname && data.DISABLED) return;
    
    let cmdname = data.CMD.toLowerCase();
    list[cmdname] = !onlyname ? adminonly(run) : data;
    
    if (data.ALIASES) {
      data.ALIASES.forEach(a => (list[a.toLowerCase()] = list[cmdname]));
    }
  });

  return list;
}

function adminonly(func) {
  return (parsed, event, bot) => {
    if (!isAdmin(event.source.userId)) {
      return null;
    }
    return func(parsed, event, bot);
  };
}
