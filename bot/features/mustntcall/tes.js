module.exports = (parsed, event) => {
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
