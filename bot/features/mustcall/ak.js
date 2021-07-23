const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  data: {
    name: "Arknek Command",
    description: "Buat ngirim info operator dari arknights",
    help: "",
    createdAt: 0,
    CMD: "ak",
    ALIASES: []
  },
  run: ak
};

async function ak(parsed, event) {
  if (!parsed.arg) return null;
  var char = parsed.arg;
  if (char.split(" ").length > 1) {
    char = char.replace(/\s/g, "-");
  }
  let res = await axios.get("https://gamepress.gg/arknights/operator/" + char);
  let body = res.data;
  body = body.replace("<br>", ". ");
  var $ = cheerio.load(body);
  if ($.text().match(/Page not found/)) {
    var echo = { type: "text", text: "Not found.." };
    return echo;
  } else {
    var rarity = 0;
    $("div.rarity-cell img").each(function(i, elm) {
      rarity += 1;
    });
    var padstar = 100 + (6 - rarity) * 10 + "px";
    var star = {
      type: "icon",
      url:
        "https://scdn.line-apps.com/n/channel_devcenter/img/fx/review_gold_star_28.png"
    };
    var o = 2;
    if (char == "amiya") {
      o = 1;
    }
    if (rarity < 3) {
      o = 1;
    }
    var stars = [];
    for (var i = 0; i < rarity; i++) {
      stars.push(star);
    }
    var faction =
      "https://gamepress.gg" + $("div.faction-cell img").attr("src");
    var kelas = $("div.profession-title")
      .text()
      .trim();
    var kelasimg =
      "https://gamepress.gg" + $("div.profession-cell img").attr("src");
    var nama = $("#page-title h1")
      .text()
      .trim();
    var tg = [];
    var ps = [];
    var tags = "Tags: ";
    $("div.tag-title").each(function(i, elm) {
      tg.push(
        $(elm)
          .text()
          .trim()
      );
    });
    $("div.text-content-cell").each(function(i, elm) {
      ps.push(
        $(elm)
          .text()
          .trim()
      );
    });
    var pos = ps[0];
    var atk = ps[1];
    for (var i = 0; i < tg.length - 1; i++) {
      tags += tg[i] + ", ";
    }
    tags = tags.slice(0, -2);
    var atype = tg[tg.length - 1];
    $("small").remove();
    var traits = "";
    $("div.description-box").each(function(i, elm) {
      if (i == 0) {
        traits = $(elm)
          .text()
          .trim();
      }
    });
    var regex = /\[(.*?)\]/;
    if (regex.exec(traits)) {
      traits = traits.replace("[" + regex.exec(traits)[1] + "]", "");
    }
    if (traits.split("* Translation")[1]) {
      traits = traits.split("* Translation")[0];
    } else if (traits.split("* Translations")[1]) {
      traits = traits.split("* Translations")[0];
    }
    var gender = "";
    $("th").each(function(i, elm) {
      if ($(elm).text() == "Gender") {
        gender = $(elm)
          .next()
          .text()
          .trim();
      }
    });
    if (gender == "") {
      gender = "Genderless";
    }
    var factionname = $("div.faction-cell img").attr("src");
    if (factionname) {
      factionname = factionname.split("/")[6];
      factionname = factionname.slice(0, -4).split("_")[1];
    } else {
      factionname = "-";
    }
    var factionarr = [
      "Rhodes Island",
      "Great Lungmen",
      "Abyssal",
      "Blacksteel",
      "Kazimierz",
      "Kjerag",
      "Laterano",
      "Leithanien",
      "Rhine Lab",
      "RIM Billiton",
      "Ursus",
      "Victoria",
      "Penguin Logistics",
      "Siesta",
      "Yan",
      "Babel"
    ];
    for (var i = 0; i < factionarr.length; i++) {
      var reg = new RegExp(factionname, "i");
      if (factionarr[i].match(reg)) {
        factionname = factionarr[i];
        break;
      }
    }
    var crsl = {
      type: "carousel",
      contents: []
    };
    var info = {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "image",
            url:
              "https://i.ibb.co/7RpZMWy/92874464-1290398757826006-720291115328077824-o.jpg",
            position: "absolute",
            aspectMode: "cover",
            aspectRatio: "1:1",
            offsetTop: "0px",
            offsetBottom: "0px",
            offsetStart: "0px",
            offsetEnd: "0px",
            size: "full"
          },
          {
            type: "image",
            size: "full",
            aspectRatio: "1:1",
            url:
              "https://gamepress.gg" +
              $("#image-tab-1")
                .find("img")
                .attr()["src"],
            gravity: "center",
            offsetTop: "15px"
          },
          {
            type: "image",
            url:
              "https://scdn.line-apps.com/n/channel_devcenter/img/flexsnapshot/clip/clip15.png",
            position: "absolute",
            aspectMode: "fit",
            aspectRatio: "1:1",
            offsetTop: "0px",
            offsetBottom: "0px",
            offsetStart: "0px",
            offsetEnd: "0px",
            size: "full"
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "baseline",
                contents: stars,
                spacing: "xs",
                paddingTop: "3px",
                paddingStart: padstar
              }
            ],
            position: "absolute"
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "image",
                    url: "" + faction,
                    size: "sm"
                  },
                  {
                    type: "text",
                    text: "" + factionname,
                    color: "#ffffff",
                    align: "center",
                    size: "sm",
                    wrap: true
                  }
                ],
                paddingStart: "10px",
                paddingTop: "5px"
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "image",
                    url: "" + kelasimg,
                    size: "xs"
                  },
                  {
                    type: "text",
                    text: "" + kelas,
                    color: "#ffffff",
                    align: "center",
                    size: "sm"
                  },
                  {
                    type: "text",
                    text: "" + atype,
                    color: "#ffffff",
                    size: "xxs",
                    align: "center",
                    wrap: true
                  }
                ],
                paddingStart: "140px",
                paddingTop: "5px"
              }
            ],
            position: "absolute"
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: "" + nama,
                        size: "xl",
                        color: "#ffffff",
                        weight: "bold"
                      },
                      {
                        type: "text",
                        text: "" + tags,
                        size: "xs",
                        color: "#ffffff"
                      }
                    ]
                  },
                  {
                    type: "separator"
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "box",
                        layout: "vertical",
                        contents: [
                          {
                            type: "text",
                            text: "Attack Type",
                            color: "#ffffff",
                            size: "sm",
                            weight: "bold"
                          },
                          {
                            type: "text",
                            text: "" + atk,
                            size: "xs",
                            color: "#ffffff"
                          }
                        ]
                      },
                      {
                        type: "separator"
                      },
                      {
                        type: "box",
                        layout: "vertical",
                        contents: [
                          {
                            type: "text",
                            text: "Gender",
                            color: "#ffffff",
                            size: "sm",
                            weight: "bold",
                            align: "end"
                          },
                          {
                            type: "text",
                            text: "" + gender,
                            size: "xs",
                            color: "#ffffff",
                            align: "end"
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: "separator"
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "box",
                        layout: "vertical",
                        contents: [
                          {
                            type: "text",
                            text: "Traits",
                            color: "#ffffff",
                            align: "center",
                            size: "sm"
                          },
                          {
                            type: "text",
                            text: "" + traits,
                            color: "#ffffff",
                            align: "center",
                            wrap: true,
                            size: "xs"
                          }
                        ]
                      }
                    ],
                    margin: "sm"
                  }
                ],
                spacing: "xs"
              }
            ],
            position: "absolute",
            offsetBottom: "0px",
            offsetStart: "0px",
            offsetEnd: "0px",
            paddingAll: "20px"
          }
        ],
        paddingAll: "0px"
      }
    };
    crsl.contents.push(info);
    //console.log(JSON.stringify(info))
    for (var i = 10; i > o - 1; i--) {
      if (
        $("#image-tab-" + i)
          .find("img")
          .attr()
      ) {
        var boble = {
          type: "bubble",
          hero: {
            type: "image",
            url:
              "https://gamepress.gg" +
              $("#image-tab-" + i)
                .find("img")
                .attr()["src"],
            size: "full",
            action: {
              type: "uri",
              label: "action",
              uri:
                "https://gamepress.gg" +
                $("#image-tab-" + i)
                  .find("img")
                  .attr()["src"]
            }
          }
        };
        crsl.contents.push(boble);
      }
    }
    var h2 = encodeURIComponent(parsed.arg);
    crsl.contents.push({
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "Open in Aceship",
              uri:
                "https://aceship.github.io/AN-EN-Tags/akhrchars.html?opname=" +
                h2
            },
            offsetTop: "100px",
            style: "secondary"
          }
        ]
      }
    });
  }
  //console.log(JSON.stringify(crsl));
  var echo = {
    type: "flex",
    altText: "Arknek: " + char,
    contents: crsl
  };
  return echo;
}
