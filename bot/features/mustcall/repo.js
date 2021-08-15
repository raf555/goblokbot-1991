module.exports = {
  data: {
    name: "Repo Command",
    description: "Command buat nampilin repo",
    usage: "[@bot/!] repo",
    createdAt: 0,
    CMD: "repo",
    ALIASES: []
  },
  run: function(parsed, event, bot) {
    return {
      type: "text",
      text: "https://github.com/raf555/goblokbot-1991"
    };
  }
};
