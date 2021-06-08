const { exec } = require("child_process");

module.exports = (parsed, event) => {
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
};
