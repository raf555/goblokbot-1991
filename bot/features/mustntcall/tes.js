module.exports = (parsed, event) => {
  if (parsed.args.args) {
    return {
      type: "text",
      text: JSON.stringify(parsed.args, null, 1)
    };
  }
  if (!!parsed.arg) {
    return null;
  }
  let lat = Date.now() - event.timestamp;
  return {
    type: "text",
    text: "tis\n\n" + lat + " ms",
    latency: lat
  };
};
