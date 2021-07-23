const fs = require("fs");

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
    list[cmdname] = !onlyname ? run : data;
    
    if (!onlyname && data.ALIASES) {
      data.ALIASES.forEach(a => (list[a.toLowerCase()] = list[cmdname]));
    }
  });

  return list;
}
