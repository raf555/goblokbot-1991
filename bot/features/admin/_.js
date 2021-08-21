module.exports = {
  data: {
    name: "Test command",
    description: "Command buat tes",
    help: "!_",
    CMD: "_",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    return {
      type: "text",
      text: "none",
      nosave: true
    };
  }
};
