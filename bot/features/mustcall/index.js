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
    if (data.DISABLED) return;
    
    let cmdname = data.CMD.toLowerCase();
    list[cmdname] = !onlyname ? run : 1;
    if (data.ALIASES) {
      data.ALIASES.forEach(a => (list[a.toLowerCase()] = list[cmdname]));
    }
  });

  return list;
}
