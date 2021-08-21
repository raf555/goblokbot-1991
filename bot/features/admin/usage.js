const db = require("@utils/database");

module.exports = {
  data: {
    name: "Usage command",
    description: "Command buat cek usage bot",
    help: "@bot usage",
    CMD: "usage",
    ALIASES: []
  },
  run: (parsed, event, bot) => {
    return makebubble();
  }
};

function makebubble() {
  let date = new Date();
  //date.setMonth(date.getMonth() - 1);
  let month = date.toLocaleString("ID", { month: "long" });

  let hist = toArr(db.open("db/cmdhistory.json").get());
  let userdb = getUser(db.open("db/user.json").get());

  let mostshortcut = hist.filter(d => d.shortcut).length;
  let mostcallnorm = hist.length - mostshortcut;
  let calledtimes = hist.filter(d => d.called).length;
  let mostcalledcmd = mostCalledCMD(hist);
  let mostcalledcmdgr = mostCalledCMDgr(hist);
  let mostcalledcmdpc = mostCalledCMDpc(hist);
  let mostcaller = mostCaller(hist);
  let mostcallergr = mostCallerGr(hist);
  let mostcallerpc = mostCallerPc(hist);
  let cmdspd = cmdspeed(hist);
  let fastestcmd = cmdspd[0];
  let slowestcmd = cmdspd[cmdspd.length - 1];
  let avgspdcmd = cmdspeedavg(hist);
  let avgspdcmdslow = cmdspeedavg(hist, true);

  let text =
    "Sebulan terakhir..\n\n" +
    "-----BOT-------\n" +
    "-Bot lebih banyak dipanggil dengan cara: " +
    (mostshortcut > mostcallnorm ? "shortcut" : "biasa") +
    `\n-Bot dipanggil sebanyak: ${calledtimes} kali` +
    `\n-Command dipanggil terbanyak: ${mostcalledcmd.cmd} - ${mostcalledcmd.tot} kali` +
    `\n-Command tercepat: ${fastestcmd.command} - ${fastestcmd.lat} ms` +
    `\n-Command terlambat: ${slowestcmd.command} - ${slowestcmd.lat} ms` +
    `\n-Command tercepat (overall): ${avgspdcmd.cmd} - ${avgspdcmd.lat} ms` +
    "\n\n-----USER-------\n" +
    `-Yang sering pake bot (keseluruhan): ${userdb[mostcaller.id]} - ${
      mostcaller.tot
    } kali` +
    `\n-Yang sering pake bot di grup: ${userdb[mostcallergr.id]} - ${
      mostcallergr.tot
    } kali` +
    `\n-Yang sering pake bot di pc: ${userdb[mostcallerpc.id]} - ${
      mostcallerpc.tot
    } kali` +
    `\n-Bot sering dipanggil jam: ${parseInt(jam(hist).jam) + 7}`;

  return {
    type: "flex",
    altText: "Bot Report - " + month + " " + date.getFullYear(),
    contents: {
      type: "carousel",
      contents: [
        {
          type: "bubble",
          hero: {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "Bot's Report",
                    align: "center",
                    weight: "bold",
                    size: "xl"
                  },
                  {
                    type: "text",
                    text: month + " " + date.getFullYear(),
                    align: "center"
                  }
                ]
              }
            ],
            paddingTop: "10px"
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
                    type: "text",
                    text: "USER",
                    align: "center"
                  }
                ]
              },
              {
                type: "text",
                size: "xs",
                wrap: true,
                contents: [
                  {
                    type: "span",
                    text: "> Bot sering dipanggil di grup oleh: "
                  },
                  {
                    type: "span",
                    text:
                      userdb[mostcallergr.id] + ` (${mostcallergr.tot} kali)`,
                    weight: "bold"
                  }
                ]
              },
              {
                type: "text",
                size: "xs",
                wrap: true,
                contents: [
                  {
                    type: "span",
                    text: "> Bot sering dipanggil di pc oleh: "
                  },
                  {
                    type: "span",
                    text:
                      userdb[mostcallerpc.id] + ` (${mostcallerpc.tot} kali)`,
                    weight: "bold"
                  }
                ]
              },
              {
                type: "text",
                size: "xs",
                wrap: true,
                contents: [
                  {
                    type: "span",
                    text: "> Bot sering dipanggil pukul: "
                  },
                  {
                    type: "span",
                    text: parseInt(jam(hist).jam) + 7 + " WIB",
                    weight: "bold"
                  }
                ]
              }
            ]
          },
          styles: {
            body: {
              separator: true
            }
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
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "BOT",
                    align: "center"
                  }
                ]
              },
              {
                type: "text",
                size: "xs",
                wrap: true,
                contents: [
                  {
                    type: "span",
                    text: "> Bot lebih banyak dipanggil dengan cara: "
                  },
                  {
                    type: "span",
                    text: mostshortcut > mostcallnorm ? "shortcut" : "biasa",
                    weight: "bold"
                  }
                ]
              },
              {
                type: "text",
                size: "xs",
                wrap: true,
                contents: [
                  {
                    type: "span",
                    text: "> Bot udah dipanggil sebanyak: "
                  },
                  {
                    type: "span",
                    text: calledtimes + " kali",
                    weight: "bold"
                  }
                ]
              },
              {
                type: "text",
                size: "xs",
                wrap: true,
                contents: [
                  {
                    type: "span",
                    text: "> Command yang sering dipake di grup: "
                  },
                  {
                    type: "span",
                    text:
                      mostcalledcmdgr.cmd + ` (${mostcalledcmdgr.tot} kali)`,
                    weight: "bold"
                  }
                ]
              },
              {
                type: "text",
                size: "xs",
                wrap: true,
                contents: [
                  {
                    type: "span",
                    text: "> Command yang sering dipake di pc: "
                  },
                  {
                    type: "span",
                    text:
                      mostcalledcmdpc.cmd + ` (${mostcalledcmdpc.tot} kali)`,
                    weight: "bold"
                  }
                ]
              },
              {
                type: "text",
                size: "xs",
                wrap: true,
                contents: [
                  {
                    type: "span",
                    text: "> Respon Command paling cepet: "
                  },
                  {
                    type: "span",
                    text: fastestcmd.command + ` (${fastestcmd.lat} ms)`,
                    weight: "bold"
                  }
                ]
              },
              {
                type: "text",
                size: "xs",
                wrap: true,
                contents: [
                  {
                    type: "span",
                    text: "> Respon Command paling lemot: "
                  },
                  {
                    type: "span",
                    text: slowestcmd.command + ` (${slowestcmd.lat} ms)`,
                    weight: "bold"
                  }
                ]
              },
              {
                type: "text",
                size: "xs",
                wrap: true,
                contents: [
                  {
                    type: "span",
                    text: "> Respon Command paling cepet (overall): "
                  },
                  {
                    type: "span",
                    text: avgspdcmd.cmd + ` (${parseInt(avgspdcmd.lat)} ms)`,
                    weight: "bold"
                  }
                ]
              },
              {
                type: "text",
                size: "xs",
                wrap: true,
                contents: [
                  {
                    type: "span",
                    text: "> Respon Command paling lambat (overall): "
                  },
                  {
                    type: "span",
                    text:
                      avgspdcmdslow.cmd +
                      ` (${parseInt(avgspdcmdslow.lat)} ms)`,
                    weight: "bold"
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  };
}

function getUser(data) {
  let out = {};
  Object.values(data).forEach(d => {
    out[d.id] = d.name;
  });
  return out;
}

function toArr(data) {
  return Object.keys(data).map(i =>
    Object.assign({ idx: parseInt(i) }, data[i])
  );
}

function mostCalledCMD(data) {
  let a = {};

  data.forEach(d => {
    if (!(d.command in a)) {
      a[d.command] = 1;
    } else {
      a[d.command]++;
    }
  });

  return Object.keys(a)
    .map(b => ({ cmd: b, tot: a[b] }))
    .sort((a, b) => b.tot - a.tot)[0];
}

function mostCalledCMDgr(data) {
  let a = {};

  data
    .filter(d => d.fromGroup)
    .forEach(d => {
      if (!(d.command in a)) {
        a[d.command] = 1;
      } else {
        a[d.command]++;
      }
    });

  return Object.keys(a)
    .map(b => ({ cmd: b, tot: a[b] }))
    .sort((a, b) => b.tot - a.tot)[0];
}

function mostCalledCMDpc(data) {
  let a = {};

  data
    .filter(d => !d.fromGroup)
    .forEach(d => {
      if (!(d.command in a)) {
        a[d.command] = 1;
      } else {
        a[d.command]++;
      }
    });

  return Object.keys(a)
    .map(b => ({ cmd: b, tot: a[b] }))
    .sort((a, b) => b.tot - a.tot)[0];
}

function mostCaller(data) {
  let a = {};

  data.forEach(d => {
    if (!(d.id in a)) {
      a[d.id] = 1;
    } else {
      a[d.id]++;
    }
  });

  return Object.keys(a)
    .map(b => ({ id: b, tot: a[b] }))
    .sort((a, b) => b.tot - a.tot)[0];
}

function mostCallerGr(data) {
  let a = {};

  data
    .filter(d => d.fromGroup)
    .forEach(d => {
      if (!(d.id in a)) {
        a[d.id] = 1;
      } else {
        a[d.id]++;
      }
    });

  return Object.keys(a)
    .map(b => ({ id: b, tot: a[b] }))
    .sort((a, b) => b.tot - a.tot)[0];
}

function mostCallerPc(data) {
  let a = {};

  data
    .filter(d => !d.fromGroup)
    .forEach(d => {
      if (!(d.id in a)) {
        a[d.id] = 1;
      } else {
        a[d.id]++;
      }
    });

  return Object.keys(a)
    .map(b => ({ id: b, tot: a[b] }))
    .sort((a, b) => b.tot - a.tot)[0];
}

function cmdspeed(data) {
  return data.sort((a, b) => a.lat - b.lat);
}

function cmdspeedavg(data, slow = false) {
  let a = {};

  data.forEach(d => {
    if (!(d.command in a)) {
      a[d.command] = d.lat;
    } else {
      a[d.command] += d.lat;
    }
  });

  Object.keys(a).forEach(b => {
    a[b] /= data.filter(d => d.command === b).length;
  });

  return Object.keys(a)
    .map(b => ({ cmd: b, lat: a[b] }))
    .sort((a, b) => a.lat - b.lat)[!slow ? 0 : Object.keys(a).length - 1];
}

function jam(data) {
  let a = {};

  data
    .map(d => new Date(d.ts).getHours())
    .forEach(b => {
      if (!(b in a)) {
        a[b] = 1;
      } else {
        a[b]++;
      }
    });

  return Object.keys(a)
    .map(b => ({ jam: b, tot: a[b] }))
    .sort((a, b) => -a.tot + b.tot)[0];
}
