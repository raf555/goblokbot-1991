const { exec } = require("child_process");

module.exports = function movedb() {
  console.log("restarting bot..");
  exec(`refresh`, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
};
