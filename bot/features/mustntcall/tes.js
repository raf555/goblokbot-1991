module.exports = (parsed, event) => {
  return {
    type: "text",
    text: "tis\n\n" + (Date.now() - event.timestamp) + " ms"
  };
};
