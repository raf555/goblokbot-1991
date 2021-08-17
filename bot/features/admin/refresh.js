const { exec } = require("child_process");

module.exports = {
  data: {
    name: "Refresh Command",
    description: "Command buat refresh git & restart bot",
    usage: "[@bot/!] refresh",
    ADMIN: true,
    CMD: "refresh",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    setTimeout(() => {
      exec("git prune ; git gc ; refresh", (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          return;
        }

        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      });
    }, 3000);
    return { type: "text", text: "restarting in 3s.." };
  }
};
