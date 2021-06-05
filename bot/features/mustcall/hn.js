module.exports = (parsed, event) => {
  return require("./hololive")(parsed, event, true);
};
