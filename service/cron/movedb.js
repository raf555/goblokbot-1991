const { exec } = require("child_process");

module.exports = function movedb() {
  let ts = Date.now();
  let date = maketgl(ts);
  // job every first day of month at 05.01 utc (12.01 utc+7)
  console.log("renaming latency and cmdhistory database..");
  exec(
    `mkdir db/bak/${date} ; mv db/latency.json db/bak/${date}/latency.json ; mv db/cmdhistory.json db/bak/${date}/cmdhistory.json`,
    (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        return;
      }

      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    }
  );
};

function maketgl(ts) {
  let date = new Date(ts);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
