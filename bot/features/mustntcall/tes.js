module.exports = (parsed, event) => {
  if (!!parsed.arg){
    return null;
  }
  return {
    type: "text",
    text: "tis\n\n" + (Date.now() - event.timestamp) + " ms"
  };
};
