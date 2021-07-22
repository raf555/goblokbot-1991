const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  data: {
    name: "Azan cmd",
    description: "Fitur buat liat jadwal azan di Jakarta",
    help: "",
    createdAt: 0,
    CMD: "azan",
    ALIASES: []
  },
  run: azan
};

async function azan() {
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
  var jamsu,
    mntsu,
    detiksu = "";
  var jamzu,
    mntzu,
    detikzu = "";
  var jamas,
    mntas,
    detikas = "";
  var jamma,
    mntma,
    detikma = "";
  var jamis,
    mntis,
    detikis = "";
  var wktusu,
    wktuzu,
    wktuas,
    wktuma,
    wktuis = "";
  var progsu,
    progzu,
    progas,
    progma,
    progis = "";
  var $ = cheerio.load(body);
  var todei = $("li[class='d-flex justify-content-between']");
  todei.each(function(i, elm) {
    if (i == 0) {
      var wktma = $(elm)
        .text()
        .replace("Subuh (Fajr)", "")
        .split(":");
      wktusu = $(elm)
        .text()
        .replace("Subuh (Fajr)", "");
      jamsu = wktma[0];
      mntsu = wktma[1];
      detiksu = parseInt(jamsu) * 60 + parseInt(mntsu);
      progsu = Math.round((detiks * 100) / detiksu) + "%";
    } else if (i == 2) {
      var wktma = $(elm)
        .text()
        .replace("Dzuhur", "")
        .split(":");
      wktuzu = $(elm)
        .text()
        .replace("Dzuhur", "");
      jamzu = wktma[0];
      mntzu = wktma[1];
      detikzu = parseInt(jamzu) * 60 + parseInt(mntzu);
      progzu = Math.round((detiks * 100) / detikzu) + "%";
    } else if (i == 3) {
      var wktma = $(elm)
        .text()
        .replace("Ashar", "")
        .split(":");
      wktuas = $(elm)
        .text()
        .replace("Ashar", "");
      jamas = wktma[0];
      mntas = wktma[1];
      detikas = parseInt(jamas) * 60 + parseInt(mntas);
      progas = Math.round((detiks * 100) / detikas) + "%";
    } else if (i == 4) {
      var wktma = $(elm)
        .text()
        .replace("Maghrib", "")
        .split(":");
      wktuma = $(elm)
        .text()
        .replace("Maghrib", "");
      jamma = wktma[0];
      mntma = wktma[1];
      detikma = parseInt(jamma) * 60 + parseInt(mntma);
      progma = Math.round((detiks * 100) / detikma) + "%";
    } else if (i == 5) {
      var wktma = $(elm)
        .text()
        .replace("Isya", "")
        .split(":");
      wktuis = $(elm)
        .text()
        .replace("Isya", "");
      jamis = wktma[0];
      mntis = wktma[1];
      detikis = parseInt(jamis) * 60 + parseInt(mntis);
      progis = Math.round((detiks * 100) / detikis) + "%";
    }
  });
  //console.log(wktusu, wktuzu, wktuas, wktuma, wktuis);
  //console.log(progsu, progzu, progas, progma, progis);
  var echo = {
    type: "flex",
    altText: "Waktu Salat - DKI Jakarta",
    contents: {
      type: "bubble",
      size: "micro",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "Waktu Salat",
            color: "#ffffff",
            align: "start",
            size: "lg",
            weight: "bold"
          },
          {
            type: "text",
            text: "DKI Jakarta",
            color: "#ffffff",
            size: "xs"
          }
        ],
        backgroundColor: "#43A047",
        paddingTop: "19px",
        paddingAll: "12px",
        paddingBottom: "16px"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "Subuh",
                    size: "sm"
                  },
                  {
                    type: "text",
                    text: "" + wktusu,
                    size: "sm",
                    align: "end"
                  }
                ]
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
                    width: "" + progsu,
                    backgroundColor: "#388E3C",
                    height: "6px"
                  }
                ],
                backgroundColor: "#9FD8E36E",
                height: "6px",
                margin: "sm",
                position: "relative"
              }
            ]
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "Zuhur",
                    size: "sm"
                  },
                  {
                    type: "text",
                    text: "" + wktuzu,
                    size: "sm",
                    align: "end"
                  }
                ]
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
                    width: "" + progzu,
                    backgroundColor: "#388E3C",
                    height: "6px"
                  }
                ],
                backgroundColor: "#9FD8E36E",
                height: "6px",
                margin: "sm",
                position: "relative"
              }
            ],
            margin: "lg"
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "Asar",
                    size: "sm"
                  },
                  {
                    type: "text",
                    text: "" + wktuas,
                    size: "sm",
                    align: "end"
                  }
                ]
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
                    width: "" + progas,
                    backgroundColor: "#388E3C",
                    height: "6px"
                  }
                ],
                backgroundColor: "#9FD8E36E",
                height: "6px",
                margin: "sm",
                position: "relative"
              }
            ],
            margin: "lg"
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "Magrib",
                    size: "sm"
                  },
                  {
                    type: "text",
                    text: "" + wktuma,
                    size: "sm",
                    align: "end"
                  }
                ]
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
                    width: "" + progma,
                    backgroundColor: "#388E3C",
                    height: "6px"
                  }
                ],
                backgroundColor: "#9FD8E36E",
                height: "6px",
                margin: "sm",
                position: "relative"
              }
            ],
            margin: "lg"
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "Isya",
                    size: "sm"
                  },
                  {
                    type: "text",
                    text: "" + wktuis,
                    size: "sm",
                    align: "end"
                  }
                ]
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
                    width: "" + progis,
                    backgroundColor: "#388E3C",
                    height: "6px"
                  }
                ],
                backgroundColor: "#9FD8E36E",
                height: "6px",
                margin: "sm",
                position: "relative"
              }
            ],
            margin: "lg"
          }
        ],
        spacing: "sm",
        paddingAll: "13px"
      }
    }
  };
  let crsl = {
    type: "flex",
    altText: "Waktu Salat - DKI Jakarta",
    contents: {
      type: "carousel",
      contents: [echo.contents]
    }
  };
  let mgrb = null;
  /*let mgrb = await magrib();
  if (mgrb != null) {
    mgrb = mgrb.contents;
    mgrb.header.contents.pop();
    mgrb.header.contents[0].text = "Puasa";
    mgrb.body.contents.shift();
    mgrb.header.backgroundColor = "#43A047";
    mgrb.body.contents[1].contents[0].backgroundColor = "#388E3C";
    mgrb.body.contents[0].color = "#388E3C";
    crsl.contents.contents.push(mgrb);
  }*/
  return mgrb == null ? echo : crsl;
}
