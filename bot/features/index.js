const adminjs = require("./admin");
const mustcalljs = require("./mustcall");
const mustntcalljs = require("./mustntcall");

module.exports = getfeatures;

function getfeatures(onlyname = false) {
  let mustcall = mustcalljs(onlyname);

  // assign admin features
  Object.assign(mustcall, adminjs(onlyname));

  return {
    mustcall: mustcall,
    mustntcall: mustntcalljs(onlyname)
  };
}
