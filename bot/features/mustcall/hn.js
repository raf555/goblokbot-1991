let h = require("./hololive");
module.exports = (parsed, event) => {
  return h(parsed, event, true);
};
