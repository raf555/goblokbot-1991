const fs = require("fs");

module.exports = getfeatures;

function getfeatures(onlyname = false) {
  const condition = name => {
    return name !== "index.js";
  };

  let list = {};

  let features = fs
    .readdirSync(__dirname)
    .filter(name => condition(name) && name.endsWith(".js"));

  features.forEach(name => {
    let { data, run } = require("./" + name);
    if (!onlyname && data.DISABLED) return;
    
    let cmdname = data.CMD.toLowerCase();
    list[cmdname] = !onlyname ? run : data;
    
    if (data.ALIASES) {
      data.ALIASES.forEach(a => (list[a.toLowerCase()] = list[cmdname]));
    }
  });

  return list;
}
