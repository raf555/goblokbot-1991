module.exports = {
  data: {
    name: "Delay Command",
    description: "Command buat tes delay",
    usage: "[@bot/!] delay <time>?",
    createdAt: 0,
    CMD: "delay",
    ALIASES: []
  },
  run: function(parsed, event, bot) {
    let time = Number(parsed.arg || "1"); // in second

    return new Promise(resolve => {
      setTimeout(resolve, time * 1000, {
        type: "text",
        text: time + " seconds has passed"
      });
    });
  }
};
