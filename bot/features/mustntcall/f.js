module.exports = () => {
  if (!!parsed.arg) return null;
  var echo = { type: "text", text: "F" };
  var echo1 = {
    type: "sticker",
    packageId: "11539",
    stickerId: "52114141"
  };
  return [echo, echo1];
};
