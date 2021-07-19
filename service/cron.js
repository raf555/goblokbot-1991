const cron = require("node-cron");
const { exec } = require("child_process");

module.exports = () => {
  console.log("Scheduled job has started");
  cron.schedule("0 8 1 * *", function() {
    // job every first day of month at 8 utc (15 utc+7)
    console.log("renaming latency and cmdhistory database..");
    exec(
      "mv db/latency.json db/bak/latency2.json ; mv db/cmdhistory.json db/bak/cmdhistory2.json",
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
  });
};
