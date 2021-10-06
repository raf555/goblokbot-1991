const db = require("@utils/database");
const { angkaAcak, gethashidfromuid } = require("./utility");

module.exports = {
  addSocialCredit,
  addMoreSocialCredit,
  getxpbylevel,
  getlevelbyxp,
  getrank,
  getranks,
  getscdata
};

const constant = 0.09;

function getgap() {
  return angkaAcak(30000, 60000);
}

function addMoreSocialCredit(id) {
  return addcredit(id, true);
}

function addSocialCredit(id, custom = null) {
  return addcredit(id, false, custom);
}

function addcredit(id, isfrombonus, custom) {
  const scdb = db.open("db/socialcredit.json");
  const user = db.open("db/user.json");
  const now = Date.now();

  id = gethashidfromuid(id, user.get());
  if (!id) return;

  let data = scdb.get(id);

  if (!data) {
    scdb.set(id, {
      xp: 0,
      level: 0,
      last: 0,
      lastbonus: 0,
      count: 0
    });
    data = scdb.get(id);
  }

  if (isfrombonus) {
    if (now <= data.lastbonus + getgap()) return;
  } else {
    if (custom === null && now <= data.last + getgap()) return;
  }

  let xp;
  if (isfrombonus) {
    xp = angkaAcak(25, 50);
  } else {
    if (custom !== null) {
      xp = custom;
    } else {
      xp = angkaAcak(10, 25);
    }
  }
  let curxp = data.xp;
  let acc = curxp + xp;
  let newlevel = getlevelbyxp(acc);

  let changelvl = newlevel !== data.level;

  if (isfrombonus) {
    scdb.set(id, {
      xp: acc,
      level: newlevel,
      last: data.last,
      lastbonus: now
    });
  } else {
    scdb.set(id, {
      xp: acc,
      level: newlevel,
      last: now,
      lastbonus: data.lastbonus
    });
  }
  scdb.save();

  let out = "",
    emoji = "",
    color = "",
    icon;
  if (changelvl) {
    if (newlevel <= data.level) {
      out = user.get(id).name + " has leveled down to level " + newlevel;
      color = "#B71C1C";
      emoji = "👎👎👎";
      icon = "https://image.prntscr.com/image/t2QaS89gRIiEbsGo6I4-MQ.png";
    } else {
      out = user.get(id).name + " has leveled up to level " + newlevel;
      color = "#1E88E5";
      emoji = "🎉🎉🎉";
      icon = "https://image.prntscr.com/image/rxoXBSART7C5qKBjcgP5Yg.png";
    }
  }

  let outobj = {
    xp: acc,
    level: newlevel,
    levelchange: changelvl,
    message: out,
    messageobj: {
      type: "flex",
      contents: makecb(
        user.get(id).name,
        user.get(id).image,
        newlevel,
        emoji,
        color
      ),
      altText: "Level change",
      sender: {
        name: "Social Credit Bot",
        iconUrl: icon
      }
    }
  };

  return outobj;
}

/** new leveling algorithm */
function getprog(lvl) {
  return Math.floor(10 * Math.pow(lvl, 2) + 69.69 * lvl + 123.42069);
}
function getxpbylevel(lvl) {
  let xp = 0;
  for (let i = 0; i < lvl; i++) {
    xp += getprog(i);
  }
  return xp;
}
function getlevelbyxp(xp) {
  let lvl = 1;
  if (xp < getxpbylevel(lvl)) return 0;
  while (getxpbylevel(lvl) <= xp) {
    lvl++;
  }
  return lvl - 1;
}
/**/

/** old leveling algorithm 
function getlevelbyxp(xp) {
  return Math.floor(Math.sqrt(xp) * constant) || 0;
}

function getxpbylevel(lvl) {
  return Math.ceil((lvl / constant) ** 2);
}
*/

function getscdata(id) {
  let a = getranks().filter(d => d.uid === id)[0];
  if (!a) {
    addSocialCredit(id, 0);
    a = getranks().filter(d => d.uid === id)[0];
  }
  return a;
}

function getrank(id) {
  let i = getranks().findIndex(d => d.uid === id);
  return i === -1 ? 999 : i + 1;
}

function getranks() {
  const scdb = db.open("db/socialcredit.json");
  const user = db.open("db/user.json");
  let keys = Object.keys(scdb.get());

  let out = [];
  Object.values(scdb.get()).forEach((sc, i) => {
    let ud = user.get(keys[i]);
    out.push({
      name: ud.name,
      image: ud.image,
      id: keys[i],
      uid: ud.id,
      key: ud.key,
      level: sc.level,
      xp: sc.xp
    });
  });

  return out.sort((b, a) => a.xp - b.xp);
}

function makecb(name, image, level, emoji, color) {
  return {
    type: "bubble",
    size: "micro",
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
                  type: "filler"
                },
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "image",
                      url: image,
                      size: "full"
                    }
                  ],
                  cornerRadius: "100px",
                  height: "64px",
                  width: "64px"
                },
                {
                  type: "filler"
                }
              ]
            },
            {
              type: "text",
              text: name || "NONAME",
              align: "center",
              size: "md",
              margin: "sm",
              wrap: true,
              color: "#ffffff"
            },
            {
              type: "text",
              text: "Level " + level,
              align: "center",
              color: "#ffffff"
            },
            {
              type: "text",
              text: emoji,
              align: "center"
            }
          ]
        }
      ],
      backgroundColor: color
    }
  };
}
