const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./../../../service/database");
const disk = require("diskusage");
const fs = require("fs");
const { detiktostr } = require("./../../utility");

const botwake = Date.now();
const stat_color = 0;

module.exports = bot_status;

function bot_status(event) {
  return axios.get("https://status.glitch.com/").then(async res => {
    var body = res.data;
    var server = "-";
    //console.log("y")
    var $ = cheerio.load(body);
    $("span.component-status ").each(function(i, elm) {
      if (i == 3) {
        server = $(elm)
          .text()
          .trim();
      }
    });
    var tgl = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta"
    });
    tgl = new Date(tgl);
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var firstDate = new Date(2019, 8, 27);
    var umur = Math.round(Math.abs((firstDate - tgl) / oneDay)) - 1;
    function days_of_a_year(year) {
      return isLeapYear(year) ? 366 : 365;
    }
    function isLeapYear(year) {
      return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
    }
    var haritaun = days_of_a_year(tgl.getFullYear());
    var mod = umur % haritaun;
    var prog = Math.round((mod * 100) / haritaun) + "%";
    if (umur >= haritaun) {
      var tahun = umur - mod;
      tahun = tahun / haritaun;
    }
    var words = "";
    if (tahun) {
      if (mod == 0) {
        words = tahun + " Tahun";
      } else {
        words = tahun + " Tahun dan " + mod + " Hari";
      }
    } else {
      words = umur + " Hari";
    }
    var status = "";
    //var beda = "";
    var color1 = "";
    var color2 = "";
    var stet = db.open("bot/setting.json");
    var g = stet.get("bot");
    if (g == 1) {
      status = "Good";
      color1 = "#27ACB2";
      color2 = "#0D8186";
      if (mod == 0) {
        status = "Bot ultah";
      }
    } else if (g == 0) {
      status = "Bot is turned off..";
      color1 = "#FF6B6E";
      color2 = "#DE5658";
    }
    if (server != "Operational") {
      color1 = "#FFA726";
      color2 = "#F57C00";
    }
    if (stat_color == 0) {
      color1 = "#27ACB2";
      color2 = "#0D8186";
    } else if (stat_color == 1) {
      color1 = "#FFA726";
      color2 = "#F57C00";
    } else if (stat_color == 2) {
      color1 = "#FF6B6E";
      color2 = "#DE5658";
    }
    var echo = {
      type: "flex",
      altText: "Bot Status",
      contents: {
        type: "bubble",
        size: "micro",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "GoblokBot 1991",
              color: "#ffffff",
              align: "start",
              size: "md",
              gravity: "center"
            },
            {
              type: "text",
              text: "" + words,
              color: "#ffffff",
              align: "start",
              size: "xs",
              gravity: "center",
              margin: "lg"
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "filler"
                    }
                  ],
                  width: "" + prog,
                  backgroundColor: "" + color2,
                  height: "6px"
                }
              ],
              backgroundColor: "#FAD2A76E",
              height: "6px",
              margin: "sm"
            }
          ],
          backgroundColor: "" + color1,
          paddingTop: "19px",
          paddingAll: "12px",
          paddingBottom: "16px"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "separator"
            },
            {
              type: "text",
              text: "Status:",
              weight: "bold",
              size: "sm",
              wrap: true
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "" + status,
                      wrap: true,
                      size: "xs",
                      flex: 5
                    }
                  ]
                }
              ]
            },
            {
              type: "separator",
              margin: "md"
            },
            {
              type: "text",
              text: "Bot Uptime:",
              weight: "bold",
              size: "sm",
              wrap: true
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text:
                        "" +
                        detiktostr(((Date.now() - botwake) / 1000).toFixed(0)),
                      wrap: true,
                      size: "xs",
                      flex: 5
                    }
                  ]
                }
              ]
            },
            {
              type: "separator",
              margin: "md"
            },
            {
              type: "text",
              text: "Server Status:",
              weight: "bold",
              size: "sm",
              wrap: true
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "RAM: " + getMemoryUsage() + "/512 MB",
                      wrap: true,
                      size: "xs",
                      flex: 5
                    }
                  ]
                },
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text:
                        "Disk: " +
                        humanFileSize(await getFreeSpace()) +
                        "/200 MB",
                      wrap: true,
                      size: "xs",
                      flex: 5
                    }
                  ]
                }
              ]
            },
            {
              type: "separator",
              margin: "md"
            },
            {
              type: "text",
              text: "Server Status:",
              weight: "bold",
              size: "sm",
              wrap: true
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "" + server,
                      wrap: true,
                      size: "xs",
                      flex: 5
                    }
                  ]
                }
              ]
            },
            {
              type: "separator",
              margin: "md"
            }
          ],
          spacing: "sm",
          paddingAll: "13px"
        },
        footer: {
          type: "box",
          layout: "vertical",
          margin: "md",
          contents: [
            {
              type: "text",
              text: "Powered by: Glitch",
              size: "xxs",
              color: "#aaaaaa",
              flex: 0,
              align: "center",
              action: {
                type: "uri",
                label: "action",
                uri: "https://glitch.com/"
              }
            }
          ]
        }
      }
    };

    return echo;
    /*return latency(
              tt[1],
              event.timestamp,
              [event.source.groupId, event.source.userId],
              echo,
              event.replyToken
            );*/
  });
}

function getMemoryUsage() {
  let total_rss = fs
    .readFileSync("/sys/fs/cgroup/memory/memory.stat", "utf8")
    .split("\n")
    .filter(l => l.startsWith("total_rss"))[0]
    .split(" ")[1];
  return Math.round(Number(total_rss) / 1e6) - 60;
}

async function getFreeSpace(path) {
  try {
    const { free } = await disk.check("/");
    return free;
  } catch (err) {
    console.error(err);
    return 0;
  }
}

function humanFileSize(bytes, si = false, dp = 1) {
  // src: https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string/14919494
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp);
}
