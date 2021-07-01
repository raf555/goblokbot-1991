let pap = require("./pap");

module.exports = (parsed, event) => {
  parsed.args.n = 12;
  return pap(parsed, event);
};
