const cron = require("node-cron");
const { movedb, opmcover, ceknilai } = require("./func");

module.exports = () => {
  // report usage
  // cron.schedule("0 5 1 * *", report);

  // move db
  cron.schedule("1 5 1 * *", movedb);

  // restart every 3 hours
  // cron.schedule("0 0 */3 * * *", restart);

  // opm cover
  // cron.schedule("*/5 * * * *", opmcover);

  // cek nilai tiap 15 menit
  // cron.schedule("*/15 * * * *", ceknilai);
  
  console.log("Scheduled job has started");
};
