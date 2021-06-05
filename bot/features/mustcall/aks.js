const db = require("./../../../service/database");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (parsed, event) => {
  var f = db.open(`bot/assets/arknek/akdb.json`);
  var h2 = "";
  var h = "";
  var char = "";
  if (!parsed.arg) return null;
  char = parsed.arg;
  if (char.split(" ")[1]) {
    char = char.replace(" ", "-");
  }
  if (char.toLowerCase() == "poca") {
    const echo = { type: "text", text: "Do you mean rosa?" };
    char = "rosa";
  }
  //console.log(char)
  let res = await axios.get("https://gamepress.gg/arknights/operator/" + char);
  let body = res.data;
  body = body.replace(/<br>/g, ". ");
  var $ = cheerio.load(body);
  if ($.text().match(/Page not found/)) {
    const echo = { type: "text", text: "Not found.." };
    return echo
  } else {
    var xx = db.open(`bot/assets/arknek/stats/stats.json`);
    xx = xx.get();
    xx.contents[0].body.contents[0].contents[0].contents[0].url = f.get(
      char.toLowerCase() + ".pic"
    );
    xx.contents[0].body.contents[0].contents[1].contents[1].text =
      "Name: " +
      $("#page-title")
        .find("h1")
        .text()
        .trim();
    xx.contents[0].body.contents[0].contents[1].contents[2].text =
      "Rarity: " + f.get(char.toLowerCase() + ".rarity");
    xx.contents[0].body.contents[0].contents[1].contents[3].text =
      "Class: " +
      $("div.profession-title")
        .text()
        .trim();
    var stat = [{}, {}, {}];
    $("script").each(function(i, elm) {
      if (
        $(elm)
          .text()
          .match(/var mystats/i)
      ) {
        //console.log((/\{[^{}\n]*\n[^{}]*\}/g).exec($(elm).text())
        var arts = $(elm)
          .text()
          .match(/"arts": "([^"]+)"/g);
        var cost = $(elm)
          .text()
          .match(/"cost": "([^"]+)"/g);
        for (var i = 0; i < arts.length; i++) {
          stat[i].arts = JSON.parse("{" + arts[i] + "}").arts;
          stat[i].cost = JSON.parse("{" + cost[i] + "}").cost;
        }
        for (var i = 7; i < 12; i++) {
          //console.log(stat)
          var dat = [
            JSON.parse(
              $(elm)
                .text()
                .match(/\{[^{}\n]*\n[^{}]*\}/g)
                [i].replace(/\n/g, "")
                .replace(/\t/g, "")
            ),
            JSON.parse(
              $(elm)
                .text()
                .match(/\{[^{}\n]*\n[^{}]*\}/g)
                [i + 1].replace(/\n/g, "")
                .replace(/\t/g, "")
            )
          ];
          stat[(i - 3) / 2 - 2].base = {
            HP: dat[0].HP,
            ATK: dat[0].ATK,
            DEF: dat[0].DEF,
            block: dat[0].block
          };
          stat[(i - 3) / 2 - 2].max = {
            HP: dat[1].HP,
            ATK: dat[1].ATK,
            DEF: dat[1].DEF,
            block: dat[1].block
          };
          if (i <= 9) i += 1;
        }
        return false;
      }
    });
    if (f.get(char.toLowerCase() + ".rarity") <= 3) {
      if (f.get(char.toLowerCase() + ".rarity") == 3) {
        stat.pop();
      } else {
        stat.pop();
        stat.pop();
      }
    }
    for (var i = 0; i < stat.length; i++) {
      xx.contents[0].body.contents[1].contents[2].contents.push({
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "Elite " + i,
                color: "#ffffff"
              }
            ],
            offsetTop: "20px",
            offsetStart: "3px",
            width: "60px"
          },
          {
            type: "separator"
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
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: "Base:",
                        color: "#ffffff",
                        size: "xxs"
                      }
                    ],
                    width: "30px"
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: "HP: " + stat[i].base.HP,
                        size: "xxs",
                        color: "#ffffff"
                      },
                      {
                        type: "text",
                        text: "ATK: " + stat[i].base.ATK,
                        size: "xxs",
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
                        text: "DEF: " + stat[i].base.DEF,
                        size: "xxs",
                        color: "#ffffff"
                      },
                      {
                        type: "text",
                        text: "Block: " + stat[i].base.block,
                        size: "xxs",
                        color: "#ffffff"
                      }
                    ],
                    margin: "xs"
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
                        text: "Res: " + stat[i].arts,
                        size: "xxs",
                        color: "#ffffff"
                      },
                      {
                        type: "text",
                        text: "Cost:" + stat[i].cost,
                        size: "xxs",
                        color: "#ffffff"
                      }
                    ],
                    margin: "xs"
                  }
                ],
                paddingStart: "5px"
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
                        text: "Max:",
                        color: "#ffffff",
                        size: "xxs"
                      }
                    ],
                    width: "30px"
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: "HP: " + stat[i].max.HP,
                        size: "xxs",
                        color: "#ffffff"
                      },
                      {
                        type: "text",
                        text: "ATK: " + stat[i].max.ATK,
                        size: "xxs",
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
                        text: "DEF: " + stat[i].max.DEF,
                        size: "xxs",
                        color: "#ffffff"
                      },
                      {
                        type: "text",
                        text: "Block: " + stat[i].max.block,
                        size: "xxs",
                        color: "#ffffff"
                      }
                    ],
                    margin: "xs"
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
                        text: "Res: " + stat[i].arts,
                        size: "xxs",
                        color: "#ffffff"
                      },
                      {
                        type: "text",
                        text: "Cost: " + stat[i].cost,
                        size: "xxs",
                        color: "#ffffff"
                      }
                    ],
                    margin: "xs"
                  }
                ],
                paddingStart: "5px"
              }
            ]
          }
        ],
        margin: "lg",
        backgroundColor: "#000000"
      });
    }
    var talent = [
      {
        type: "text",
        text: "Talent(s)"
      }
    ];
    $("div.talent-cell").each(function(i, elm) {
      $(elm)
        .find("div.talent-child")
        .each(function(i, elm) {
          var ar = {
            type: "box",
            layout: "vertical",
            contents: [
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
                        text: $(elm)
                          .find("div.talent-title")
                          .text()
                          .trim(),
                        color: "#ffffff",
                        wrap: true,
                        weight: "bold",
                        size: "sm"
                      }
                    ],
                    paddingTop: "5px",
                    paddingStart: "2px"
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "box",
                        layout: "baseline",
                        contents: [
                          {
                            type: "filler"
                          },
                          {
                            type: "icon",
                            url:
                              "https://gamepress.gg" +
                              $(elm)
                                .find("div.elite-level")
                                .find("img")
                                .attr("src"),
                            size: "xl",
                            offsetTop: "2px"
                          },
                          {
                            type: "icon",
                            url:
                              "https://gamepress.gg" +
                              $(elm)
                                .find("div.potential-level")
                                .find("img")
                                .attr("src"),
                            size: "xl",
                            offsetTop: "5px"
                          },
                          {
                            type: "text",
                            text: $(elm)
                              .find("div.operator-level")
                              .text()
                              .trim(),
                            color: "#ffffff",
                            size: "sm"
                          }
                        ]
                      }
                    ],
                    width: "130px"
                  }
                ]
              },
              {
                type: "text",
                text: $(elm)
                  .find("div.talent-description")
                  .text()
                  .trim(),
                offsetStart: "2px",
                color: "#ffffff",
                wrap: true,
                size: "xs"
              }
            ],
            backgroundColor: "#000000",
            margin: "lg"
          };
          talent.push(ar);
        });
    });
    var poten = [
      {
        type: "text",
        text: "Potentials"
      }
    ];
    var $ = cheerio.load(body);
    $("div.potential-cell")
      .find("div.potential-list")
      .each(function(i, elm) {
        var potenarr = {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "baseline",
              contents: [
                {
                  type: "icon",
                  url:
                    "https://gamepress.gg/sites/arknights/files/2019-10/" +
                    (i + 2) +
                    "_0.png",
                  size: "xl",
                  offsetTop: "5px"
                },
                {
                  type: "text",
                  text: $(elm)
                    .text()
                    .trim(),
                  color: "#ffffff",
                  size: "sm"
                }
              ]
            }
          ],
          backgroundColor: "#000000",
          margin: "lg"
        };
        poten.push(potenarr);
      });
    poten.push({
      type: "text",
      text: "Trust Bonus",
      margin: "md"
    });
    var $ = cheerio.load(body);
    $("div.trust-cell")
      .find("div.potential-list")
      .each(function(i, elm) {
        var potenarr = {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: $(elm)
                    .text()
                    .trim(),
                  color: "#ffffff",
                  size: "sm"
                }
              ]
            }
          ],
          backgroundColor: "#000000",
          margin: "lg"
        };
        poten.push(potenarr);
      });
    xx.contents[1].body.contents = talent;
    xx.contents[2].body.contents = poten;
    //console.log(JSON.stringify(xx))
    var echo = {
      type: "flex",
      altText:
        "Arknights Stats: " +
        $("#page-title")
          .find("h1")
          .text()
          .trim(),
      contents: xx,
      quickReply: {
        items: [
          {
            type: "action",
            action: {
              type: "message",
              label: "Info",
              text: "@bot ak " + (h2 || char.replace("-", ""))
            }
          },
          {
            type: "action",
            action: {
              type: "message",
              label: "Mats",
              text: "@bot akm " + (h2 || char.replace("-", ""))
            }
          }
        ]
      }
    };
    return echo
  }
};
