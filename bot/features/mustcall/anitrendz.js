const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  data: {
    name: "Anitrendz Command",
    description: "Command buat scrape data dari anitrendz.net",
    usage: "[@bot/!] anitrendz [male/female/ship/op/ed]?",
    createdAt: 0,
    CMD: "anitrendz",
    ALIASES: []
  },
  run: anitrendz
};

async function anitrendz(parsed, event, bot) {
  var url = "";
  var info = "";
  var tt = parsed.arg.toLowerCase();
  if (!tt) {
    url = "https://anitrendz.net/charts/top-anime/";
    info = "Anime";
  } else {
    if (tt == "male") {
      url = "https://anitrendz.net/charts/male-characters/";
      info = "Male Characters";
    } else if (tt == "female") {
      url = "https://anitrendz.net/charts/female-characters/";
      info = "Female Characters";
    } else if (tt == "ship") {
      url = "https://anitrendz.net/charts/couple-ship/";
      info = "Couple Ship";
    } else if (tt == "op") {
      url = "https://anitrendz.net/charts/op-theme-songs/";
      info = "Opening Song";
    } else if (tt == "ed") {
      url = "https://anitrendz.net/charts/ed-theme-songs/";
      info = "Ending Song";
    } else {
      url = "https://anitrendz.net/charts/top-anime/";
      info = "Anime";
    }
  }
  let res = await axios.get(url);
  let body = res.data;
  var $ = cheerio.load(body);
  var bbl1 = [];
  var bbl2 = [];
  var week = "";
  $("div.at-cth-b-week-no").each(function(i, elm) {
    if (i == 0) {
      week = $(elm)
        .text()
        .trim();
    }
  });
  $("div.at-main-chart-entries")
    .find("div.at-mcc-entry")
    .each(function(i, elm) {
      var bbl = {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text:
                  $(elm)
                    .find("div.at-mcc-e-rank")
                    .text()
                    .trim()
                    .match(/\d+/)[0] + ".",
                size: "lg",
                color: "#ffffff",
                weight: "bold"
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "icon",
                    url: $(elm)
                      .find("div.at-mcc-e-movement")
                      .find("div.arrow-container")
                      .find("img")
                      .attr("src")
                  }
                ]
              },
              {
                type: "text",
                text: $(elm)
                  .find("div.at-mcc-e-movement")
                  .find("div.arrow-number")
                  .text()
                  .trim(),
                size: "sm",
                color: "#ffffff"
              }
            ],
            width: "40px"
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: $(elm)
                  .find("div.at-mcc-e-details")
                  .find("div.entry-title")
                  .text()
                  .trim(),
                color: "#ffffff",
                size: "sm",
                wrap: true
              },
              {
                type: "text",
                text: $(elm)
                  .find("div.at-mcc-e-details")
                  .find("div.entry-detail")
                  .text()
                  .trim(),
                size: "xs",
                color: "#FFFFFF",
                style: "italic",
                wrap: true
              }
            ],
            margin: "md"
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "image",
                url: $(elm)
                  .find("div.at-mcc-e-details")
                  .find("div.at-mcc-e-thumbnail")
                  .find("img")
                  .attr("src"),
                aspectMode: "cover"
              }
            ],
            width: "70px",
            height: "70px",
            cornerRadius: "50px"
          }
        ],
        borderColor: "#ffffff",
        borderWidth: "1px",
        paddingAll: "3px"
      };
      if (i < 4) {
        bbl1.push(bbl);
      } else {
        if (i >= 4 && i < 10) {
          bbl2.push(bbl);
        }
      }
    });
  var crsl = {
    type: "carousel",
    contents: [
      {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "Top 10 " + info,
                  weight: "bold",
                  color: "#ffffff",
                  size: "lg"
                },
                {
                  type: "text",
                  text: week,
                  weight: "bold",
                  color: "#ffffff",
                  size: "xs"
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
                      type: "box",
                      layout: "horizontal",
                      contents: [
                        {
                          type: "box",
                          layout: "baseline",
                          contents: [
                            {
                              type: "spacer"
                            },
                            {
                              type: "icon",
                              url:
                                "https://anitrendz.net/regular/main/images/icons/new.png"
                            },
                            {
                              type: "text",
                              text: "baru",
                              margin: "xs",
                              color: "#ffffff"
                            }
                          ]
                        },
                        {
                          type: "box",
                          layout: "baseline",
                          contents: [
                            {
                              type: "spacer"
                            },
                            {
                              type: "icon",
                              url:
                                "https://anitrendz.net/regular/main/images/icons/up-arrow.png"
                            },
                            {
                              type: "text",
                              text: "naik",
                              margin: "xs",
                              color: "#ffffff"
                            }
                          ]
                        },
                        {
                          type: "box",
                          layout: "baseline",
                          contents: [
                            {
                              type: "icon",
                              url:
                                "https://anitrendz.net/regular/main/images/icons/down-arrow.png"
                            },
                            {
                              type: "text",
                              text: "turun",
                              margin: "xs",
                              color: "#ffffff"
                            }
                          ]
                        }
                      ]
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
                                "https://anitrendz.net/regular/main/images/icons/re-entry.png"
                            },
                            {
                              type: "text",
                              text: "balik",
                              margin: "xs",
                              color: "#ffffff"
                            }
                          ]
                        },
                        {
                          type: "box",
                          layout: "baseline",
                          contents: [
                            {
                              type: "icon",
                              url:
                                "https://anitrendz.net/regular/main/images/icons/right-arrow.png"
                            },
                            {
                              type: "text",
                              text: "tetep",
                              margin: "xs",
                              color: "#ffffff"
                            },
                            {
                              type: "filler"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ],
              margin: "sm",
              borderColor: "#ffffff",
              borderWidth: "1px"
            },
            {
              type: "box",
              layout: "vertical",
              contents: bbl1,
              margin: "sm"
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "Scraped from anitrendz.net",
                  color: "#ffffff",
                  size: "sm",
                  align: "end"
                }
              ],
              margin: "xxl"
            }
          ],
          backgroundColor: "#1a1a1a"
        }
      },
      {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: bbl2,
              margin: "sm"
            }
          ],
          backgroundColor: "#1a1a1a"
        }
      }
    ]
  };
  //console.log(JSON.stringify(crsl))
  return {
    type: "flex",
    altText: "Top 10 " + info,
    contents: crsl
  };
}
