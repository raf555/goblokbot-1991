const fs = require("fs");

module.exports = getfeatures;

function getfeatures(onlyname = false) {
  let mustcall = require("./mustcall")(onlyname);
  
  // assign admin features
  Object.assign(mustcall, require("./admin")(onlyname))
  
  return {
    mustcall: mustcall,
    mustntcall: require("./mustntcall")(onlyname)
  };
}
