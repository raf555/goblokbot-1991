const { getxpbylevel, getrank, getscdata } = require("@bot/socialcredit");
const db = require("@utils/database");
const { isAdmin, gethashidfromuid, gethashidfromkey } = require("@bot/utility");

module.exports = {
  data: {
    name: "Rank Command",
    description: "Command buat nampilin rank user",
    usage: "[@bot/!] rank",
    CMD: "rank",
    ALIASES: []
  },
  run: function(parsed, event, bot) {
    let data = db.open("db/user.json").get();

    let id, uid;
    if (parsed.arg) {
      id = gethashidfromkey(parsed.arg);
      if (!id) {
        return {
          type: "text",
          text: "Not found"
        };
      }
      uid = data[id].id;
    } else {
      id = gethashidfromuid(event.source.userId);
      uid = event.source.userId;
    }

    let scdata = getscdata(uid);
    let curxp = scdata.xp;
    let level = scdata.level;
    let nextlevel = level + 1;
    let nextxp = getxpbylevel(nextlevel);

    let cmdc = Object.values(db.open("db/cmdhistory.json").get()).filter(
      d => d.id === uid && d.fromGroup
    ).length;
    let banc = Object.values(db.open("db/banhistory.json").get()).filter(
      d => d.id === uid
    ).length;

    let cmd = makecard(
      uid,
      data[id],
      level,
      curxp,
      nextxp,
      cmdc,
      banc,
      parsed.args.detail
    );

    return bot.function.exec(cmd, event).then(res => {
      res[0].cmd = "rank";
      return res[0];
    });
  }
};

function makecard(
  uid,
  data,
  level,
  curxp,
  nextxp,
  cmdcount,
  bancount,
  xpdetail
) {
  let defimg =
    "https://cdn.glitch.com/6fe2de81-e459-4790-8106-a0efd4b2192d%2Fno-image-profile.png?v=1622879440349";
  let name = data.name || "NONAME";
  if (name.length > 17) {
    name = name.substring(0, 17) + "..";
  }
  let image = data.image;
  let explow = getxpbylevel(level);
  let prog1 = curxp - explow;
  let prog2 = nextxp - explow;
  let prog = Math.ceil((prog1 / prog2) * 570);
  if (curxp <= 0) {
    prog = 1;
  }
  let rank = getrank(uid);

  let isadmin = isAdmin(uid);
  let membership = isadmin ? "Admin" : "Member";

  if (rank === 1) {
    isadmin = true;
  }

  let bgcolor = isadmin ? "#37474F" : "#23272A";
  let cardcolor = "#090A0B";
  let progbgcolor = isadmin ? "#37474F" : "#484B4E";
  let progcolor = isadmin ? "#78909C" : "#0277BD";
  let progcurxp = xpdetail
    ? curxp.toLocaleString("id-ID")
    : numFormatter(curxp);
  let progtext = `${progcurxp} / ${numFormatter(nextxp)}`;
  let progtext2 = `${numFormatter(prog1)} / ${numFormatter(prog2)}`;
  let date = new Date().toLocaleString("id-ID", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta"
  });

  if (curxp <= 0) {
    prog = 1;
    progcolor = "#B71C1C";
    bgcolor = "#D50000";
  }

  cmdcount = cmdcount.toLocaleString("id-ID");
  bancount = bancount.toLocaleString("id-ID");

  let cmd = `!jimp -new "-w 670 -h 256 -c ${bgcolor}"
-composite "-new '-w 598 -h 192 -c ${cardcolor}' -pos 35,35"
-composite2 "-url ${image || defimg} -resize 128,128 -pos 50,50"
-composite3 "-new '-w 570 -h 20 -c ${progbgcolor}' -pos 50,190"
-composite4 "-new '-w ${prog} -h 20 -c ${progcolor}' -pos 50,190"
-print "-b _ -color white -text _${name}_ -pos 197,50"
-print2 "-color white -text ${membership} -pos 199,83 -size 16"
-print3 "-color white -text '#${rank}' -pos 620-twidth,50 -size 32"
-print4 "-color white -text '${progcurxp}' -pos 620-twidth,85 -size 16"
-print5 "-color white -text '${progtext2}' -pos 620-twidth,159 -size 16"
-print6 "-color white -text 'Level ${level}' -pos 620-twidth,139 -size 16"
-print7 "-color white -text 'Goblokbot 1991' -pos 665-twidth,235 -size 16"
-print8 "-color white -text 'Monthly summary' -pos 197,119 -size 16"
-print9 "-color white -text '- ${cmdcount}x bot used' -pos 197,139 -size 16"
-print10 "-color white -text '- ${bancount}x banned' -pos 197,159 -size 16"
-print11 "-color white -text '${date}' -pos 5,245 -size 8"`;

  return cmd;
}

//https://stackoverflow.com/a/32638472
function numFormatter(num, fixed = 1) {
  if (num === null) {
    return null;
  } // terminate early
  if (num === 0) {
    return "0";
  } // terminate early
  fixed = !fixed || fixed < 0 ? 0 : fixed; // number of decimal places to show
  var b = num.toPrecision(2).split("e"), // get power
    k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
    c =
      k < 1
        ? num.toFixed(0 + fixed)
        : (num / Math.pow(10, k * 3)).toFixed(1 + fixed), // divide by power
    d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
    e = d + ["", "K", "M", "B", "T"][k]; // append power
  return e.replace(/\./g, ",").replace(/,0+$/, "");
}
