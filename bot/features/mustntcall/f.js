module.exports = {
  data: {
    name: "F",
    description: "Buat pay respect",
    usage: "f",
    createdAt: 0,
    CMD: "f",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    if (!!parsed.arg) return null;
    var echo = { type: "text", text: "F" };
    var echo1 = {
      type: "sticker",
      packageId: "11539",
      stickerId: "52114141"
    };
    return [echo, echo1];
  }
};
