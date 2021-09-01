const cron = require("node-cron");
const { movedb, report, restart } = require("./func");

module.exports = () => {
  console.log("Scheduled job has started");

  // report usage
  // cron.schedule("0 5 1 * *", report);

  // move db
  cron.schedule("1 5 1 * *", movedb);
  
  // restart every 3 hours
  // cron.schedule("0 0 */3 * * *", restart);
};
