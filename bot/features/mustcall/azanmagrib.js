const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  data: {
    name: "Magrib Warning",
    description: "Fitur buat warning selama puasa",
    usage: "[@bot/!] magrib",
    DISABLED: true,
    CMD: "magrib",
    ALIASES: []
  },
  run: magrib
};

async function magrib(parsed, event, bot) {
  return null;

  var skrg = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jakarta"
  });
  skrg = new Date(skrg);

  var jams = skrg.getHours();
  var mnts = skrg.getMinutes();
  var detiks = jams * 60 + mnts;
  let data = await axios.get(
    "https://www.muslimpro.com/id/Waktu-sholat-Jakarta-Indonesia-1642911"
  );
  let body = data.data;

  var jamma = "";
  var mntma = "";
  var detikma = "";
  var jamsu = "";
  var mntsu = "";
  var detiksu = "";
  var $ = cheerio.load(body);
  var todei = $("li[class='d-flex justify-content-between']");
  todei.each(function(i, elm) {
    if (i == 4) {
      //ganti ke 4 kl udh puasa
      var wktma = $(elm)
        .text()
        .replace("Maghrib", "")
        .split(":");
      jamma = wktma[0];
      mntma = wktma[1];
      detikma = parseInt(jamma) * 60 + parseInt(mntma);
    } else if (i == 0) {
      var wktsu = $(elm)
        .text()
        .replace("Subuh (Fajr)", "")
        .split(":");
      jamsu = wktsu[0];
      mntsu = wktsu[1];
      detiksu = parseInt(jamsu) * 60 + parseInt(mntsu);
    }
  });
  //console.log(detiksu, detikma)
  if (detiks < detikma && detiks >= detiksu) {
    //console.log("blm");
    var prog = Math.round((detiks * 100) / detikma) + "%";
    var progmnt = (detikma - detiks) % 60;
    var progjam = (detikma - detiks - progmnt) / 60;

    //"" + progjam + " Jam dan " + progmnt + " Menit";
    var words = "";
    if (progjam == 0) {
      words = progmnt + " Menit";
    } else if (progmnt == 0) {
      words = progjam + " Jam";
    } else {
      words = progjam + " Jam dan " + progmnt + " Menit";
    }

    const echo = {
      type: "flex",
      altText: "PAP",
      contents: {
        type: "bubble",
        size: "micro",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "Mohon Maaf",
              color: "#ffffff",
              align: "start",
              size: "md",
              gravity: "center",
              weight: "bold"
            },
            {
              type: "text",
              text: "Fitur PAP dibatasi selama bulan puasa",
              color: "#ffffff",
              align: "start",
              size: "xs",
              gravity: "center",
              margin: "lg",
              wrap: true
            }
          ],
          backgroundColor: "#F44336"
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text:
                "Demi mencegah hal-hal yang tidak diinginkan, fitur PAP dimatikan hingga",
              weight: "bold",
              size: "xxs",
              wrap: true
            },
            {
              type: "text",
              text: words,
              weight: "bold",
              size: "sm",
              color: "#C62828"
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
                  backgroundColor: "#C62828",
                  height: "6px"
                }
              ],
              backgroundColor: "#9FD8E36E",
              height: "6px",
              margin: "sm"
            },
            {
              type: "text",
              text: "Menuju Maghrib",
              weight: "bold",
              wrap: true,
              size: "sm",
              margin: "md"
            },
            {
              type: "text",
              text: "Waktu DKI Jakarta",
              weight: "bold",
              size: "xxs",
              wrap: true,
              margin: "none"
            }
          ],
          spacing: "sm",
          paddingAll: "13px"
        }
      }
    };
    return echo;
  } else {
    return null;
  }
}
