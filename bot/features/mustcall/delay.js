module.exports = {
  data: {
    name: "Delay Command",
    description: "Command buat tes delay",
    help: "",
    createdAt: 0,
    CMD: "delay",
    ALIASES: []
  },
  run: function(parsed, event, bot) {
    let time = Number(parsed.arg || "1"); // in second

    return new Promise(resolve => {
      setTimeout(
        () =>
          resolve({
            type: "text",
            text: time + " second has passed"
          }),
        time * 1000
      );
    });
  }
};
