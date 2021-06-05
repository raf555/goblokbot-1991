module.exports = async (parsed, event) => {
  return await require("./yt")(parsed, event, true);
};
