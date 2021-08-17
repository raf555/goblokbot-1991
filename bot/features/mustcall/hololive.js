const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./../../../service/database");

module.exports = {
  data: {
    name: "Hololive cmd",
    description: "Command buat ngasih live schedule liver hololep",
    usage: "[@bot/!] hololive",
    DISABLED: true,
    CMD: "hololive",
    ALIASES: ["h"]
  },
  run: async (parsed, event) => {
    let now = parsed.args.now
    let url;
    if (parsed.arg.toLowerCase() == "id") {
      url = "https://schedule.hololive.tv/lives/indonesia";
    } else if (parsed.arg.toLowerCase() == "en") {
      url = "https://schedule.hololive.tv/lives/english";
    }
    let tt = "@bot hololive";
    if (now) {
      tt += " now";
    }
    return hololep(tt.split(" "), event, url);
  }
};

async function hololep(tt, event, url) {
  var h = "";
  if (!tt[2]) {
    let res = await axios.get(
      url || "https://schedule.hololive.tv/lives/hololive",
      { headers: { Cookie: "timezone=Asia/Jakarta" } }
    );
    let body = res.data;
    //console.log(err);
    var $ = cheerio.load(body);
    var tgl = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta"
    });
    tgl = new Date(tgl);
    var nowsekon = tgl.getHours() * 3600 + tgl.getMinutes() * 60;
    var tudey =
      (tgl.getMonth() < 9 ? "0" + (tgl.getMonth() + 1) : tgl.getMonth() + 1) +
      "/" +
      (tgl.getDate() < 10 ? "0" + tgl.getDate() : tgl.getDate());

    tgl.setDate(new Date(tgl).getDate() + 1);
    var isuk =
      (tgl.getMonth() < 9 ? "0" + (tgl.getMonth() + 1) : tgl.getMonth() + 1) +
      "/" +
      (tgl.getDate() < 10 ? "0" + tgl.getDate() : tgl.getDate());
    var ti = 0;
    var ti2 = 0;
    var sc = "";
    $("div[class='tab-pane show active']")
      .find("div.container")
      .each(function(i, elm) {
        var skedul = $(elm)
          .find("div[class='holodule navbar-text']")
          .text()
          .trim();
        if (skedul != "") {
          var reg = new RegExp(tudey);
          var regi = new RegExp(isuk);
          if (skedul.match(reg)) {
            ti = i;
            return false;
          } else if (skedul.match(regi)) {
            ti2 = i;
            return false;
          }
        }
      });
    if (ti2 == 0) {
      ti2 = 1000;
    }
    var count = 0;
    var crsl = {
      type: "carousel",
      contents: []
    };
    var deto = "";
    $("div[class='tab-pane show active']")
      .find("div.container")
      .each(function(i, elm) {
        if (i >= ti /* && i < ti2*/) {
          var skedul = $(elm)
            .find("div[class='holodule navbar-text']")
            .text()
            .trim();
          if (skedul != "") {
            deto = skedul.slice(0, -3).replace(/\s/g, "");
          }
          $(elm)
            .find("a.thumbnail")
            .each(function(i, elm) {
              var link = $(elm).attr("href");
              var jam = $(elm)
                .find("div.datetime")
                .text()
                .trim();
              var jamsekon =
                parseInt(
                  $(elm)
                    .find("div.datetime")
                    .text()
                    .trim()
                    .split(":")[0]
                ) *
                  3600 +
                parseInt(
                  $(elm)
                    .find("div.datetime")
                    .text()
                    .trim()
                    .split(":")[1]
                ) *
                  60;
              var nama = $(elm)
                .find("div.name")
                .text()
                .trim();

              if (jamsekon >= nowsekon || isuk == deto) {
                var collab = false;
                var collabimg = [];
                var thumb = "";
                var profpic = "";
                var ava = "#";
                $(elm)
                  .find("img")
                  .each(function(i, elm) {
                    if (i > 0) {
                      if (i == 1) {
                        thumb = $(elm).attr("src");
                      } else if (i == 2) {
                        ava += /#([\d\D]*) /.exec($(elm).attr("style"))[1];
                        profpic = $(elm).attr("src");
                      } else {
                        collab = true;
                        collabimg.push([
                          "#" + /#([\d\D]*) /.exec($(elm).attr("style"))[1],
                          $(elm).attr("src")
                        ]);
                      }
                    }
                  });
                if (nama == "癒月ちょこ" && collab) {
                  collabimg.shift();
                  if (collabimg.length < 1) {
                    collab = false;
                  }
                }
                var metadata = fetchs(
                  "https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&key=" +
                    process.env.yts_api +
                    "&id=" +
                    /\?v=([\d\D]*)/.exec(link)[1]
                ).json();
                count += 1;
                if (count <= 12) {
                  var boble = {
                    type: "bubble",
                    size: "micro",
                    hero: {
                      type: "image",
                      url: thumb,
                      size: "full",
                      aspectMode: "cover",
                      aspectRatio: "16:9",
                      action: {
                        type: "uri",
                        label: "action",
                        uri: link
                      }
                    },
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
                                  type: "box",
                                  layout: "vertical",
                                  contents: [
                                    {
                                      type: "image",
                                      url: profpic,
                                      action: {
                                        type: "uri",
                                        label: "action",
                                        uri:
                                          "https://youtube.com/channel/" +
                                          metadata.items[0].snippet.channelId
                                      }
                                    }
                                  ],
                                  width: "35px",
                                  height: "35px",
                                  cornerRadius: "100px",
                                  margin: "xs",
                                  offsetBottom: "1px",
                                  offsetStart: "1px"
                                }
                              ],
                              width: "37px",
                              height: "37px",
                              backgroundColor: ava,
                              cornerRadius: "100px"
                            },
                            {
                              type: "box",
                              layout: "vertical",
                              contents: [
                                {
                                  type: "text",
                                  text: metadata.items[0].snippet.channelTitle,
                                  weight: "bold",
                                  size: "xs",
                                  action: {
                                    type: "uri",
                                    label: "action",
                                    uri:
                                      "https://youtube.com/channel/" +
                                      metadata.items[0].snippet.channelId
                                  }
                                },
                                {
                                  type: "text",
                                  text:
                                    deto == tudey
                                      ? jam + " WIB"
                                      : deto.split("/")[1] +
                                        "-" +
                                        deto.split("/")[0] +
                                        "-" +
                                        tgl.getFullYear() +
                                        " - " +
                                        jam +
                                        " WIB", //jam + " WIB",
                                  size: deto == tudey ? "xxs" : "9.2px",
                                  wrap: true
                                }
                              ],
                              margin: "sm"
                            }
                          ]
                        }
                      ]
                    }
                  };
                  if (collab) {
                    boble.body.contents.push({
                      type: "separator",
                      margin: "xs"
                    });
                    var clbj = {
                      type: "box",
                      layout: "vertical",
                      contents: [
                        {
                          type: "text",
                          text: "Collab with",
                          size: "xs"
                        },
                        {
                          type: "box",
                          layout: "horizontal",
                          contents: [],
                          margin: "xs"
                        }
                      ]
                    };
                    var rumus = (collabimg.length - (collabimg.length % 3)) / 3;
                    if (collabimg.length > 3) {
                      for (var xx = 0; xx < rumus; xx++) {
                        clbj.contents.push({
                          type: "box",
                          layout: "horizontal",
                          contents: [],
                          margin: "xs"
                        });
                      }
                    }
                    for (var i = 0; i < collabimg.length; i++) {
                      var pushk = (i - (i % 3)) / 3 + 1;
                      var pushj = {
                        type: "box",
                        layout: "vertical",
                        contents: [
                          {
                            type: "box",
                            layout: "vertical",
                            contents: [
                              {
                                type: "image",
                                url: collabimg[i][1]
                              }
                            ],
                            width: "43px",
                            height: "43px",
                            cornerRadius: "100px",
                            margin: "xs",
                            offsetBottom: "1px",
                            offsetStart: "1px"
                          }
                        ],
                        width: "45px",
                        height: "45px",
                        backgroundColor: collabimg[i][0],
                        cornerRadius: "100px"
                      };
                      if (i % 3 != 0) {
                        pushj.margin = "xs";
                      }
                      clbj.contents[pushk].contents.push(pushj);
                    }
                    boble.body.contents.push(clbj);
                  }
                  crsl.contents.push(boble);
                }
              }
            });
        }
      });
    //console.log(JSON.stringify(crsl));
    var echo = {
      type: "flex",
      altText: "Hololive - Stream Schedule",
      contents: crsl,
      sender: {
        name: "Hololive",
        iconUrl:
          "https://i.ibb.co/BBZSdJL/fc620067-166e-48d9-baa7-44abee59e6e1.jpg"
      },
      cmd: "hololep"
    };
    if (crsl.contents.length < 1) {
      var echo = {
        type: "text",
        text: "There is no stream schedule right now..",
        sender: {
          name: "Hololive",
          iconUrl:
            "https://i.ibb.co/BBZSdJL/fc620067-166e-48d9-baa7-44abee59e6e1.jpg"
        },
        cmd: "hololep"
      };
    }
    return echo;
  } else {
    if (tt[2].toLowerCase() == "now") {
      let res = await axios.get(
        url || "https://schedule.hololive.tv/lives/hololive",
        { headers: { Cookie: "timezone=Asia/Jakarta" } }
      );
      let body = res.data;
      var $ = cheerio.load(body);
      var crsl = {
        type: "carousel",
        contents: []
      };
      $("a.thumbnail").each(function(i, elm) {
        var count = 0;
        if (
          $(elm)
            .attr("style")
            .match(/border: 3px red/i)
        ) {
          var collab = false;
          var collabimg = [];
          var link = $(elm).attr("href");
          var jam = $(elm)
            .find("div.datetime")
            .text()
            .trim();
          var nama = $(elm)
            .find("div.name")
            .text()
            .trim();
          var thumb = "";
          var ava = "";
          var avaco = "#";
          $(elm)
            .find("img")
            .each(function(i, elm) {
              if (i > 0) {
                if (i == 1) {
                  thumb = $(elm).attr("src");
                } else if (i == 2) {
                  ava = $(elm).attr("src");
                  avaco += /#([\d\D]*) /.exec($(elm).attr("style"))[1];
                } else {
                  collab = true;
                  collabimg.push([
                    "#" + /#([\d\D]*) /.exec($(elm).attr("style"))[1],
                    $(elm).attr("src")
                  ]);
                }
              }
            });

          if (nama == "癒月ちょこ" && collab) {
            collabimg.shift();
            if (collabimg.length < 1) {
              collab = false;
            }
          }
          var metadata = fetchs(
            "https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&key=" +
              process.env.yts_api +
              "&id=" +
              /\?v=([\d\D]*)/.exec(link)[1]
          ).json();
          count += 1;
          if (count <= 12) {
            var boble = {
              type: "bubble",
              size: "micro",
              hero: {
                type: "image",
                url: thumb,
                size: "full",
                aspectMode: "cover",
                aspectRatio: "16:9",
                action: {
                  type: "uri",
                  label: "action",
                  uri: link
                }
              },
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
                            type: "box",
                            layout: "vertical",
                            contents: [
                              {
                                type: "image",
                                url: ava,
                                action: {
                                  type: "uri",
                                  label: "action",
                                  uri:
                                    "https://youtube.com/channel/" +
                                    metadata.items[0].snippet.channelId
                                }
                              }
                            ],
                            width: "35px",
                            height: "35px",
                            cornerRadius: "100px",
                            margin: "xs",
                            offsetBottom: "1px",
                            offsetStart: "1px"
                          }
                        ],
                        width: "37px",
                        height: "37px",
                        backgroundColor: avaco,
                        cornerRadius: "100px"
                      },
                      {
                        type: "box",
                        layout: "vertical",
                        contents: [
                          {
                            type: "text",
                            text: metadata.items[0].snippet.channelTitle,
                            weight: "bold",
                            size: "xs",
                            action: {
                              type: "uri",
                              label: "action",
                              uri:
                                "https://youtube.com/channel/" +
                                metadata.items[0].snippet.channelId
                            }
                          },
                          {
                            type: "text",
                            text: "Live since " + jam + " WIB",
                            size: "10px",
                            wrap: true
                          }
                        ],
                        margin: "sm"
                      }
                    ]
                  }
                ]
              }
            };
            if (collab) {
              boble.body.contents.push({
                type: "separator",
                margin: "xs"
              });
              var clbj = {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "Collab with",
                    size: "xs"
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: []
                  }
                ]
              };
              var rumus = (collabimg.length - (collabimg.length % 3)) / 3;
              if (collabimg.length > 3) {
                for (var xx = 0; xx < rumus; xx++) {
                  clbj.contents.push({
                    type: "box",
                    layout: "horizontal",
                    contents: [],
                    margin: "xs"
                  });
                }
              }
              for (var i = 0; i < collabimg.length; i++) {
                var pushk = (i - (i % 3)) / 3 + 1;
                var pushj = {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "box",
                      layout: "vertical",
                      contents: [
                        {
                          type: "image",
                          url: collabimg[i][1]
                        }
                      ],
                      width: "43px",
                      height: "43px",
                      cornerRadius: "100px",
                      margin: "xs",
                      offsetBottom: "1px",
                      offsetStart: "1px"
                    }
                  ],
                  width: "45px",
                  height: "45px",
                  backgroundColor: collabimg[i][0],
                  cornerRadius: "100px"
                };
                if (i % 3 != 0) {
                  pushj.margin = "xs";
                }
                clbj.contents[pushk].contents.push(pushj);
              }
              boble.body.contents.push(clbj);
            }
            crsl.contents.push(boble);
          }
        }
      });
      //console.log(JSON.stringify(crsl));
      var echo = {
        type: "flex",
        altText: "Hololive - Live Now",
        contents: crsl,
        sender: {
          name: "Hololive",
          iconUrl:
            "https://i.ibb.co/BBZSdJL/fc620067-166e-48d9-baa7-44abee59e6e1.jpg"
        },
        cmd: "hololep"
      };
      if (crsl.contents.length < 1) {
        var echo = {
          type: "text",
          text: "No one is streaming right now..",
          sender: {
            name: "Hololive",
            iconUrl:
              "https://i.ibb.co/BBZSdJL/fc620067-166e-48d9-baa7-44abee59e6e1.jpg"
          },
          cmd: "hololep"
        };
      }
      return echo;
    } else {
      for (i = 2; i < tt.length; i++) {
        h += "" + tt[i] + " ";
      }
      if (h.split(" ")) {
        var h2 = h.slice(0, -1);
      } else {
        h2 = h;
      }

      var dbnama = db.open("bot/assets/hololive/hololive.json");
      //console.log(Object.keys(dbnama.get()))
      var match = false;
      var matchedname = "";
      for (var i = 0; i < Object.keys(dbnama.get()).length; i++) {
        var reg = new RegExp(h2, "i");
        if (dbnama.get(Object.keys(dbnama.get())[i]).match(reg)) {
          match = true;
          matchedname = Object.keys(dbnama.get())[i];
          break;
        }
      }
      //console.log(matchedname, nama)
      if (!match) {
        var echo = {
          type: "text",
          text: "Wrong name..",
          sender: {
            name: "Hololive",
            iconUrl:
              "https://i.ibb.co/BBZSdJL/fc620067-166e-48d9-baa7-44abee59e6e1.jpg"
          },
          cmd: "hololep"
        };
        return echo;
      }
      let res = await axios.get("https://schedule.hololive.tv/lives/hololive", {
        headers: { Cookie: "timezone=Asia/Jakarta" }
      });
      let body = res.data;
      var $ = cheerio.load(body);
      var tgl = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jakarta"
      });
      tgl = new Date(tgl);
      var nowsekon = tgl.getHours() * 3600 + tgl.getMinutes() * 60;
      var tudey =
        (tgl.getMonth() < 9 ? "0" + (tgl.getMonth() + 1) : tgl.getMonth() + 1) +
        "/" +
        (tgl.getDate() < 10 ? "0" + tgl.getDate() : tgl.getDate());

      tgl.setDate(new Date(tgl).getDate() + 1);
      var isuk =
        (tgl.getMonth() < 9 ? "0" + (tgl.getMonth() + 1) : tgl.getMonth() + 1) +
        "/" +
        (tgl.getDate() < 10 ? "0" + tgl.getDate() : tgl.getDate());
      var ti = 0;
      var ti2 = 0;
      var sc = "";
      $("div[class='tab-pane show active']")
        .find("div.container")
        .each(function(i, elm) {
          var skedul = $(elm)
            .find("div[class='holodule navbar-text']")
            .text()
            .trim();
          if (skedul != "") {
            var reg = new RegExp(tudey);
            var regi = new RegExp(isuk);
            if (skedul.match(reg)) {
              ti = i;
              return false;
            } else if (skedul.match(regi)) {
              ti2 = i;
              return false;
            }
          }
        });
      if (ti2 == 0) {
        ti2 = 1000;
      }
      var count = 0;
      var crsl = {
        type: "carousel",
        contents: []
      };
      var deto = "";
      var profpic = "";
      $("div[class='tab-pane show active']")
        .find("div.container")
        .each(function(i, elm) {
          if (i >= ti /*&& i < ti2*/) {
            var skedul = $(elm)
              .find("div[class='holodule navbar-text']")
              .text()
              .trim();
            if (skedul != "") {
              deto = skedul.slice(0, -3).replace(/\s/g, "");
            }
            $(elm)
              .find("a.thumbnail")
              .each(function(i, elm) {
                var link = $(elm).attr("href");
                var jam = $(elm)
                  .find("div.datetime")
                  .text()
                  .trim();
                var jamsekon =
                  parseInt(
                    $(elm)
                      .find("div.datetime")
                      .text()
                      .trim()
                      .split(":")[0]
                  ) *
                    3600 +
                  parseInt(
                    $(elm)
                      .find("div.datetime")
                      .text()
                      .trim()
                      .split(":")[1]
                  ) *
                    60;
                var nama = $(elm)
                  .find("div.name")
                  .text()
                  .trim();
                var islive = $(elm)
                  .attr("style")
                  .match(/border: 3px red/i);
                if (
                  (jamsekon >= nowsekon || islive || isuk == deto) &&
                  matchedname == nama
                ) {
                  //console.log(jamsekon, nowsekon);
                  var collab = false;
                  var collabimg = [];
                  var thumb = "";
                  var ava = "#";
                  $(elm)
                    .find("img")
                    .each(function(i, elm) {
                      if (i > 0) {
                        if (i == 1) {
                          thumb = $(elm).attr("src");
                        } else if (i == 2) {
                          ava += /#([\d\D]*) /.exec($(elm).attr("style"))[1]; //$(elm).attr("src");
                          if (profpic == "") profpic = $(elm).attr("src");
                        } else {
                          collab = true;
                          collabimg.push([
                            "#" + /#([\d\D]*) /.exec($(elm).attr("style"))[1],
                            $(elm).attr("src")
                          ]);
                        }
                      }
                    });

                  if (nama == "癒月ちょこ" && collab) {
                    collabimg.shift();
                    if (collabimg.length < 1) {
                      collab = false;
                    }
                  }
                  var metadata = fetchs(
                    "https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&key=" +
                      process.env.yts_api +
                      "&id=" +
                      /\?v=([\d\D]*)/.exec(link)[1]
                  ).json();
                  count += 1;
                  var detop = deto.split("/");
                  if (count <= 12) {
                    //console.log(thumb)
                    var boble = {
                      type: "bubble",
                      size: "micro",
                      hero: {
                        type: "image",
                        url: thumb,
                        size: "full",
                        aspectMode: "cover",
                        aspectRatio: "16:9",
                        action: {
                          type: "uri",
                          label: "action",
                          uri: link
                        }
                      },
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
                                    type: "box",
                                    layout: "vertical",
                                    contents: [
                                      {
                                        type: "image",
                                        url: profpic,
                                        action: {
                                          type: "uri",
                                          label: "action",
                                          uri:
                                            "https://youtube.com/channel/" +
                                            metadata.items[0].snippet.channelId
                                        }
                                      }
                                    ],
                                    width: "35px",
                                    height: "35px",
                                    cornerRadius: "100px",
                                    margin: "xs",
                                    offsetBottom: "1px",
                                    offsetStart: "1px"
                                  }
                                ],
                                width: "37px",
                                height: "37px",
                                backgroundColor: ava,
                                cornerRadius: "100px"
                              },
                              {
                                type: "box",
                                layout: "vertical",
                                contents: [
                                  {
                                    type: "text",
                                    text:
                                      metadata.items[0].snippet.channelTitle,
                                    weight: "bold",
                                    size: "xs",
                                    action: {
                                      type: "uri",
                                      label: "action",
                                      uri:
                                        "https://youtube.com/channel/" +
                                        metadata.items[0].snippet.channelId
                                    }
                                  },
                                  {
                                    type: "text",
                                    text: islive
                                      ? "Live since " + jam + " WIB"
                                      : deto == tudey
                                      ? jam + " WIB"
                                      : detop[1] +
                                        "-" +
                                        detop[0] +
                                        "-" +
                                        tgl.getFullYear() +
                                        " - " +
                                        jam +
                                        " WIB",
                                    size: islive
                                      ? "10px"
                                      : deto == tudey
                                      ? "xxs"
                                      : "9.2px",
                                    wrap: true
                                  }
                                ],
                                margin: "sm"
                              }
                            ]
                          }
                        ]
                      }
                    };
                    var prog = {
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
                          width: Math.round((nowsekon / jamsekon) * 100) + "%",
                          backgroundColor: ava,
                          height: "6px"
                        }
                      ],
                      backgroundColor: "#E0E0E0",
                      height: "6px",
                      margin: "sm"
                    };

                    if (collab) {
                      boble.body.contents.push({
                        type: "separator",
                        margin: "xs"
                      });
                      var clbj = {
                        type: "box",
                        layout: "vertical",
                        contents: [
                          {
                            type: "text",
                            text: "Collab with",
                            size: "xs"
                          },
                          {
                            type: "box",
                            layout: "horizontal",
                            contents: []
                          }
                        ]
                      };
                      var rumus =
                        (collabimg.length - (collabimg.length % 3)) / 3;
                      if (collabimg.length > 3) {
                        for (var xx = 0; xx < rumus; xx++) {
                          clbj.contents.push({
                            type: "box",
                            layout: "horizontal",
                            contents: [],
                            margin: "xs"
                          });
                        }
                      }
                      for (var i = 0; i < collabimg.length; i++) {
                        var pushk = (i - (i % 3)) / 3 + 1;
                        var pushj = {
                          type: "box",
                          layout: "vertical",
                          contents: [
                            {
                              type: "box",
                              layout: "vertical",
                              contents: [
                                {
                                  type: "image",
                                  url: collabimg[i][1]
                                }
                              ],
                              width: "43px",
                              height: "43px",
                              cornerRadius: "100px",
                              margin: "xs",
                              offsetBottom: "1px",
                              offsetStart: "1px"
                            }
                          ],
                          width: "45px",
                          height: "45px",
                          backgroundColor: collabimg[i][0],
                          cornerRadius: "100px"
                        };
                        if (i % 3 != 0) {
                          pushj.margin = "xs";
                        }
                        clbj.contents[pushk].contents.push(pushj);
                      }
                      boble.body.contents.push(clbj);
                    }
                    crsl.contents.push(boble);
                  }
                }
              });
          }
        });
      //console.log(JSON.stringify(crsl));
      var echo = {
        type: "flex",
        altText: "Hololive - Stream Schedule for " + h2,
        contents: crsl,
        sender: {
          name: matchedname,
          iconUrl: profpic
        },
        cmd: "hololep"
      };
      //console.log(JSON.stringify(crsl))
      if (crsl.contents.length < 1) {
        var echo = {
          type: "text",
          text: "There is no stream schedule right now for " + h2 + "..",
          sender: {
            name: matchedname,
            iconUrl: profpic
          },
          cmd: "hololep"
        };
      }
      return echo;
    }
  }
}
