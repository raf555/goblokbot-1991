const db = require("./../../../service/database");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (parsed, event) => {
  var f = db.open(`bot/assets/arknek/akdb.json`);
  var h2 = "";
  var h = "";
  var char = "";
  if (!parsed.arg) return false;
  char = parsed.arg;
  if (char.split(" ")[1]) {
    char = char.replace(" ", "-");
  }
  if (char.toLowerCase() == "poca") {
    char = "rosa";
  }
  //console.log(char)
  let res = await axios.get("https://gamepress.gg/arknights/operator/" + char);
  let body = res.data;
  body = body.replace(/<br>/g, ". ");
  var $ = cheerio.load(body);
  if ($.text().match(/Page not found/)) {
    const echo = { type: "text", text: "Not found.." };
    return echo;
  } else {
    var xx = db.open(`bot/assets/arknek/mats/mats.json`);
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
    /*xx.contents[0].body.contents[0].contents[1].contents[2].text =
            "Class: " +
            $("div.profession-title")
              .text()
              .trim();*/
    xx.contents[0].body.contents.push(
      db
        .open(
          "bot/assets/arknek/stats/lvl-b" +
            f.get(char.toLowerCase() + ".rarity") +
            ".json"
        )
        .get()
    );
    $("td.e1-material-cost")
      .find("a")
      .each(function(i, elm) {
        var qnt = $(elm)
          .find("span.material-quantity")
          .text()
          .trim();
        if (
          qnt[qnt.length - 1] +
            "" +
            qnt[qnt.length - 2] +
            "" +
            qnt[qnt.length - 3] ==
          "000"
        ) {
          qnt = qnt.slice(0, -3);
          qnt = qnt.substr(1);
          qnt += "K";
        }
        var j = {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "image",
              url:
                "https://gamepress.gg" +
                /\((.*?)\)/.exec(
                  $(elm)
                    .find("div.material-cell")
                    .attr("style")
                )[1],
              position: "absolute"
            },
            {
              type: "image",
              url:
                "https://gamepress.gg" +
                $(elm)
                  .find("img.item-image")
                  .attr("src"),
              action: {
                type: "postback",
                label: "action",
                data:
                  "mats," +
                  $(elm)
                    .find("div.material-cell")
                    .attr("data-item")
              }
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: qnt,
                  color: "#ffffff",
                  size: "xxs"
                }
              ],
              position: "absolute",
              backgroundColor: "#000000",
              offsetTop: "25px"
            }
          ],
          width: "40px",
          height: "40px",
          margin: "sm",
          offsetTop: "3px"
        };
        xx.contents[1].body.contents[0].contents[1].contents[0].contents.push(
          j
        );
      });
    $("td.e2-material-cost")
      .find("a")
      .each(function(i, elm) {
        var qnt = $(elm)
          .find("span.material-quantity")
          .text()
          .trim();
        if (
          qnt[qnt.length - 1] +
            "" +
            qnt[qnt.length - 2] +
            "" +
            qnt[qnt.length - 3] ==
          "000"
        ) {
          qnt = qnt.slice(0, -3);
          qnt = qnt.substr(1);
          qnt += "K";
        }
        var j = {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "image",
              url:
                "https://gamepress.gg" +
                /\((.*?)\)/.exec(
                  $(elm)
                    .find("div.material-cell")
                    .attr("style")
                )[1],
              position: "absolute"
            },
            {
              type: "image",
              url:
                "https://gamepress.gg" +
                $(elm)
                  .find("img.item-image")
                  .attr("src"),
              action: {
                type: "postback",
                label: "action",
                data:
                  "mats," +
                  $(elm)
                    .find("div.material-cell")
                    .attr("data-item")
              }
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: qnt,
                  color: "#ffffff",
                  size: "xxs"
                }
              ],
              position: "absolute",
              backgroundColor: "#000000",
              offsetTop: "25px"
            }
          ],
          width: "40px",
          height: "40px",
          margin: "sm",
          offsetTop: "3px"
        };
        xx.contents[1].body.contents[0].contents[1].contents[2].contents.push(
          j
        );
      });
    $("table.table-1")
      .find("tr")
      .each(function(i, elm) {
        if (i > 0) {
          $(elm)
            .find("td")
            .find("a")
            .each(function(j, elm) {
              if ($(elm).attr("href")) {
                var j = {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "image",
                      url:
                        "https://gamepress.gg" +
                        /\((.*?)\)/.exec(
                          $(elm)
                            .find("div.material-cell")
                            .attr("style")
                        )[1],
                      position: "absolute"
                    },
                    {
                      type: "image",
                      url:
                        "https://gamepress.gg" +
                        $(elm)
                          .find("img.item-image")
                          .attr("src"),
                      action: {
                        type: "postback",
                        label: "action",
                        data:
                          "mats," +
                          $(elm)
                            .find("div.material-cell")
                            .attr("data-item")
                      }
                    },
                    {
                      type: "box",
                      layout: "vertical",
                      contents: [
                        {
                          type: "text",
                          text: $(elm)
                            .find("span.material-quantity")
                            .text()
                            .trim(),
                          color: "#ffffff",
                          size: "xxs"
                        }
                      ],
                      position: "absolute",
                      backgroundColor: "#000000",
                      offsetTop: "25px"
                    }
                  ],
                  width: "40px",
                  height: "40px",
                  margin: "sm",
                  offsetTop: "3px"
                };
                xx.contents[2].body.contents[1].contents[
                  2 * i - 2
                ].contents.push(j);
              }
            });
        }
      });
    if (f.get(char.toLowerCase() + ".rarity") > 3) {
      $("div.skill-title-cell").each(function(i, elm) {
        var yy = {
          type: "bubble",
          body: {
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
                        type: "image",
                        url:
                          "https://gamepress.gg/arknights/sites/arknights/files/game-images/skills/skill_icon_skcom_atk_up%5B3%5D.png",
                        align: "start",
                        size: "xxs"
                      }
                    ],
                    width: "50px"
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: "Skill 1: ATK Up γ",
                        size: "sm"
                      },
                      {
                        type: "text",
                        text: "Min. E2 Lv1",
                        size: "xs"
                      }
                    ]
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
                        type: "box",
                        layout: "vertical",
                        contents: [
                          {
                            type: "image",
                            url:
                              "https://gamepress.gg/arknights/sites/arknights/files/2019-10/m-1_0.png",
                            size: "xxs",
                            offsetTop: "3px"
                          }
                        ],
                        width: "50px"
                      },
                      {
                        type: "separator"
                      },
                      {
                        type: "box",
                        layout: "vertical",
                        contents: [
                          {
                            type: "image",
                            url:
                              "https://gamepress.gg/arknights/sites/arknights/files/2019-11/item-2_0.png",
                            position: "absolute"
                          },
                          {
                            type: "text",
                            text: "8h",
                            color: "#ffffff",
                            offsetTop: "8px",
                            offsetStart: "11px"
                          }
                        ],
                        width: "40px",
                        height: "40px",
                        offsetTop: "3px",
                        margin: "sm"
                      }
                    ],
                    margin: "sm",
                    height: "45px"
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
                            type: "image",
                            url:
                              "https://gamepress.gg/arknights/sites/arknights/files/2019-10/m-2_0.png",
                            size: "xxs",
                            offsetTop: "3px"
                          }
                        ],
                        width: "50px"
                      },
                      {
                        type: "separator"
                      },
                      {
                        type: "box",
                        layout: "vertical",
                        contents: [
                          {
                            type: "image",
                            url:
                              "https://gamepress.gg/arknights/sites/arknights/files/2019-11/item-2_0.png",
                            position: "absolute"
                          },
                          {
                            type: "text",
                            text: "16h",
                            color: "#ffffff",
                            offsetTop: "8px",
                            offsetStart: "6px"
                          }
                        ],
                        width: "40px",
                        height: "40px",
                        offsetTop: "3px",
                        margin: "sm"
                      }
                    ],
                    height: "45px"
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
                            type: "image",
                            url:
                              "https://gamepress.gg/arknights/sites/arknights/files/2019-10/m-3_0.png",
                            size: "xxs",
                            offsetTop: "3px"
                          }
                        ],
                        width: "50px"
                      },
                      {
                        type: "separator"
                      },
                      {
                        type: "box",
                        layout: "vertical",
                        contents: [
                          {
                            type: "image",
                            url:
                              "https://gamepress.gg/arknights/sites/arknights/files/2019-11/item-2_0.png",
                            position: "absolute"
                          },
                          {
                            type: "text",
                            text: "24h",
                            color: "#ffffff",
                            offsetTop: "8px",
                            offsetStart: "6px"
                          }
                        ],
                        width: "40px",
                        height: "40px",
                        offsetTop: "3px",
                        margin: "sm"
                      }
                    ],
                    height: "45px"
                  }
                ],
                backgroundColor: "#212121",
                margin: "lg"
              }
            ]
          }
        };
        //console.log(xx.body.contents[1].contents[0].contents.length);
        $(elm)
          .find("a")
          .each(function(i, elm) {
            if (i == 0) {
              yy.body.contents[0].contents[0].contents[0].url =
                "https://gamepress.gg" +
                $(elm)
                  .find("img")
                  .attr("src");
            } else if (i == 1) {
              yy.body.contents[0].contents[1].contents[0].text = $(elm)
                .text()
                .trim();
            }
          });
        $("table.table-2")
          .find("tr")
          .each(function(u, elm) {
            if (u > 3 * i && u <= 3 * i + 3) {
              $(elm)
                .find("td")
                .find("a")
                .each(function(k, elm) {
                  if ($(elm).attr("href")) {
                    var j = {
                      type: "box",
                      layout: "vertical",
                      contents: [
                        {
                          type: "image",
                          url:
                            "https://gamepress.gg" +
                            /\((.*?)\)/.exec(
                              $(elm)
                                .find("div.material-cell")
                                .attr("style")
                            )[1],
                          position: "absolute"
                        },
                        {
                          type: "image",
                          url:
                            "https://gamepress.gg" +
                            $(elm)
                              .find("img.item-image")
                              .attr("src"),
                          action: {
                            type: "postback",
                            label: "action",
                            data:
                              "mats," +
                              $(elm)
                                .find("div.material-cell")
                                .attr("data-item")
                          }
                        },
                        {
                          type: "box",
                          layout: "vertical",
                          contents: [
                            {
                              type: "text",
                              text: $(elm)
                                .find("span.material-quantity")
                                .text()
                                .trim(),
                              color: "#ffffff",
                              size: "xxs"
                            }
                          ],
                          position: "absolute",
                          backgroundColor: "#000000",
                          offsetTop: "25px"
                        }
                      ],
                      width: "40px",
                      height: "40px",
                      margin: "sm",
                      offsetTop: "3px"
                    };
                    //xx.body.contents[1].contents[2*u-2].contents.push(j)
                    yy.body.contents[1].contents[
                      2 * (u - 3 * i) - 2
                    ].contents.push(j);
                  }
                });
            }
          });
        var incost = $("#skill-tab-" + (i + 1))
          .find("div.initial-sp")
          .find("div.skill-upgrade-tab-10")
          .text()
          .trim();
        var spcost = $("#skill-tab-" + (i + 1))
          .find("div.sp-cost")
          .find("div.skill-upgrade-tab-10")
          .text()
          .trim();
        var ctype = $("#skill-tab-" + (i + 1))
          .find("div.sp-charge-type")
          .find("a")
          .text()
          .trim();
        var act = $("#skill-tab-" + (i + 1))
          .find("div.skill-activation")
          .find("a")
          .text()
          .trim();
        var duration = $("#skill-tab-" + (i + 1))
          .find("div.skill-duration")
          .find("div.skill-upgrade-tab-10")
          .text()
          .trim();
        var desc = $("#skill-tab-" + (i + 1))
          .find("div.skill-description")
          .find("div.skill-upgrade-tab-10")
          .text()
          .trim();
        if (desc.split("*").length > 0) {
          desc = desc.split("*")[0];
        }
        yy.body.contents.push({
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "Skill stats at M3",
              size: "sm",
              color: "#ffffff",
              weight: "bold",
              offsetStart: "3px"
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: desc,
                  wrap: true,
                  size: "xs",
                  color: "#ffffff"
                }
              ],
              paddingAll: "3px"
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
                      type: "text",
                      text: "Initial SP / SP Cost",
                      size: "xxs",
                      color: "#ffffff"
                    },
                    {
                      type: "text",
                      text: incost + " / " + spcost,
                      size: "xxs",
                      align: "end",
                      color: "#ffffff"
                    }
                  ],
                  margin: "xs"
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "SP Charge type",
                      size: "xxs",
                      color: "#ffffff"
                    },
                    {
                      type: "text",
                      text: ctype,
                      size: "xxs",
                      align: "end",
                      color: "#ffffff"
                    }
                  ]
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "Skill Activation",
                      size: "xxs",
                      color: "#ffffff"
                    },
                    {
                      type: "text",
                      text: act,
                      size: "xxs",
                      align: "end",
                      color: "#ffffff"
                    }
                  ]
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "Duration",
                      size: "xxs",
                      color: "#ffffff"
                    },
                    {
                      type: "text",
                      text: duration,
                      size: "xxs",
                      align: "end",
                      color: "#ffffff"
                    }
                  ]
                }
              ],
              paddingAll: "3px"
            }
          ],
          margin: "sm",
          backgroundColor: "#212121"
        });
        //console.log(JSON.stringify(yy));
        xx.contents.push(yy);
        //xx = {};
      });
    }

    //console.log(JSON.stringify(xx));
    var echo = {
      type: "flex",
      altText:
        "Arknights Mats: " +
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
              label: "Stats",
              text: "@bot aks " + (h2 || char.replace("-", ""))
            }
          }
        ]
      }
    };
    return echo;
  }
};
