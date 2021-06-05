const malScraper = require("mal-scraper");

module.exports = async (parsed, event) => {
  if (!parsed.arg) return false;
  let data = await malScraper.getInfoFromName(parsed.arg);
  //console.log(data);
  var title = data.title;
  var picture = data.picture;
  var engtitle = data.englishTitle;
  var score = data.score;
  var episodes = data.episodes;
  var status = data.status;
  var premiered = data.premiered;
  var aired = data.aired;
  var broadcast = data.broadcast;
  var source = data.source;
  var studios = "";
  var type = data.type;
  var genre = "";
  for (var i = 0; i < data.studios.length; i++) {
    studios += data.studios[i];
    studios += ", ";
  }
  studios = studios.slice(0, -2);
  for (var i = 0; i < data.genres.length; i++) {
    genre += data.genres[i];
    genre += ", ";
    if (i == 2) break;
  }
  genre = genre.slice(0, -2);
  var url = data.url;
  if (!title) {
    title = "-";
  }
  if (!picture) {
    picture = "-";
  }
  if (!engtitle) {
    engtitle = "-";
  }
  if (!score) {
    score = "-";
  }
  if (!episodes) {
    episodes = "-";
  }
  if (!status) {
    status = "-";
  }
  if (!premiered) {
    premiered = "-";
  }
  if (!aired) {
    aired = "-";
  }
  if (!broadcast) {
    broadcast = "-";
  }
  if (!source) {
    source = "-";
  }
  if (!studios) {
    studios = "-";
  }
  if (!url) {
    url = "-";
  }
  if (!type) {
    type = "-";
  }
  if (!genre) {
    genre = "-";
  }
  var star1, star2, star3, star4, star5;
  var scorer = Math.round(score);
  //console.log(engtitle);
  if (isNaN(score)) {
    star1 = "review_gray_star_28.png";
    star2 = "review_gray_star_28.png";
    star3 = "review_gray_star_28.png";
    star4 = "review_gray_star_28.png";
    star5 = "review_gray_star_28.png";
  } else {
    if (scorer <= 2) {
      star1 = "review_gold_star_28.png";
      star2 = "review_gray_star_28.png";
      star3 = "review_gray_star_28.png";
      star4 = "review_gray_star_28.png";
      star5 = "review_gray_star_28.png";
    } else if (scorer > 2 && scorer <= 4) {
      star1 = "review_gold_star_28.png";
      star2 = "review_gold_star_28.png";
      star3 = "review_gray_star_28.png";
      star4 = "review_gray_star_28.png";
      star5 = "review_gray_star_28.png";
    } else if (scorer > 4 && scorer <= 6) {
      star1 = "review_gold_star_28.png";
      star2 = "review_gold_star_28.png";
      star3 = "review_gold_star_28.png";
      star4 = "review_gray_star_28.png";
      star5 = "review_gray_star_28.png";
    } else if (scorer > 6 && scorer <= 8) {
      star1 = "review_gold_star_28.png";
      star2 = "review_gold_star_28.png";
      star3 = "review_gold_star_28.png";
      star4 = "review_gold_star_28.png";
      star5 = "review_gray_star_28.png";
    } else if (scorer > 8 && scorer <= 10) {
      star1 = "review_gold_star_28.png";
      star2 = "review_gold_star_28.png";
      star3 = "review_gold_star_28.png";
      star4 = "review_gold_star_28.png";
      star5 = "review_gold_star_28.png";
    }
  }
  var titlesize = "";
  var offsettop = "";
  if (title.length < 22) {
    titlesize = "xl";
    offsettop = "40px";
  } else if (title.length >= 22 && title.length <= 24) {
    titlesize = "lg";
    offsettop = "39px";
  } else if (title.length > 24) {
    titlesize = "md";
    offsettop = "38px";
  }
  var umu = {
    type: "flex",
    altText: "Anime: " + title,
    sender: {
      name: "MyAnimeList",
      iconUrl:
        "https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png"
    },
    contents: {
      type: "carousel",
      contents: [
        {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                weight: "bold",
                size: "" + titlesize,
                text: "" + title,
                wrap: true
              },
              {
                type: "text",
                text: "" + engtitle,
                size: "xs",
                style: "italic",
                wrap: true
              },
              {
                type: "box",
                layout: "baseline",
                margin: "md",
                contents: [
                  {
                    type: "icon",
                    size: "sm",
                    url:
                      "https://scdn.line-apps.com/n/channel_devcenter/img/fx/" +
                      star1
                  },
                  {
                    type: "icon",
                    size: "sm",
                    url:
                      "https://scdn.line-apps.com/n/channel_devcenter/img/fx/" +
                      star2
                  },
                  {
                    type: "icon",
                    size: "sm",
                    url:
                      "https://scdn.line-apps.com/n/channel_devcenter/img/fx/" +
                      star3
                  },
                  {
                    type: "icon",
                    size: "sm",
                    url:
                      "https://scdn.line-apps.com/n/channel_devcenter/img/fx/" +
                      star4
                  },
                  {
                    type: "icon",
                    size: "sm",
                    url:
                      "https://scdn.line-apps.com/n/channel_devcenter/img/fx/" +
                      star5
                  },
                  {
                    type: "text",
                    text: "" + score + " / 10",
                    size: "sm",
                    color: "#999999",
                    margin: "md",
                    flex: 0
                  }
                ]
              },
              {
                type: "box",
                layout: "vertical",
                margin: "xxl",
                spacing: "sm",
                contents: [
                  {
                    type: "separator",
                    margin: "xl"
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    margin: "xl",
                    contents: [
                      {
                        type: "text",
                        text: "Type",
                        size: "sm",
                        color: "#555555",
                        flex: 0
                      },
                      {
                        type: "text",
                        text: "" + type,
                        size: "sm",
                        color: "#111111",
                        align: "end"
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "Episodes",
                        size: "sm",
                        color: "#555555",
                        flex: 0
                      },
                      {
                        type: "text",
                        text: "" + episodes,
                        size: "sm",
                        color: "#111111",
                        align: "end"
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "Genres",
                        size: "sm",
                        color: "#555555",
                        flex: 0
                      },
                      {
                        type: "text",
                        text: "" + genre,
                        size: "sm",
                        color: "#111111",
                        align: "end"
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "Status",
                        size: "sm",
                        color: "#555555",
                        flex: 0
                      },
                      {
                        type: "text",
                        text: "" + status,
                        size: "sm",
                        color: "#111111",
                        align: "end"
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "Premiered",
                        size: "sm",
                        color: "#555555",
                        flex: 0
                      },
                      {
                        type: "text",
                        text: "" + premiered,
                        size: "sm",
                        color: "#111111",
                        align: "end"
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "Aired",
                        size: "sm",
                        color: "#555555",
                        flex: 0
                      },
                      {
                        type: "text",
                        text: "" + aired,
                        size: "sm",
                        color: "#111111",
                        align: "end"
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "Broadcast",
                        size: "sm",
                        color: "#555555",
                        flex: 0
                      },
                      {
                        type: "text",
                        text: "" + broadcast,
                        size: "sm",
                        color: "#111111",
                        align: "end"
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "Source",
                        size: "sm",
                        color: "#555555",
                        flex: 0
                      },
                      {
                        type: "text",
                        text: "" + source,
                        size: "sm",
                        color: "#111111",
                        align: "end"
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "Studios",
                        size: "sm",
                        color: "#555555",
                        flex: 0
                      },
                      {
                        type: "text",
                        text: "" + studios,
                        size: "sm",
                        color: "#111111",
                        align: "end"
                      }
                    ]
                  },
                  {
                    type: "separator",
                    margin: "xxl"
                  },
                  {
                    type: "box",
                    layout: "baseline",
                    margin: "md",
                    contents: [
                      {
                        type: "spacer"
                      },
                      {
                        type: "filler"
                      },
                      {
                        type: "text",
                        text: " Open in MAL",
                        color: "#aaaaaa",
                        size: "xs",
                        action: {
                          type: "uri",
                          label: "action",
                          uri: "" + url
                        }
                      },
                      {
                        type: "icon",
                        size: "md",
                        url: "https://i.ibb.co/WDq47D8/Untitled.png",
                        offsetTop: "3.5px"
                      },
                      {
                        type: "filler"
                      },
                      {
                        type: "spacer"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        },
        {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "image",
                url: "" + picture,
                size: "full",
                aspectMode: "fit",
                align: "center",
                offsetTop: "" + offsettop
              }
            ],
            paddingAll: "0px"
          }
        }
      ]
    }
  };
  var echo = {
    type: "text",
    text: "MAL is currenty unavailable.."
  };
  return umu;
};
