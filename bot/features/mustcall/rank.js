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
    let msgc = numFormatter(scdata.count || 0);

    let cmd = makecard(uid, data[id], level, curxp, nextxp, msgc);

    return bot.function.exec(cmd, event).then(res => {
      res[0].cmd = "rank";
      return res[0];
    });
  }
};

function makecard(uid, data, level, curxp, nextxp, count) {
  let defimg =
    "https://cdn.glitch.com/6fe2de81-e459-4790-8106-a0efd4b2192d%2Fno-image-profile.png?v=1622879440349";
  let name = data.name || "NONAME";
  if (name.length > 17) {
    name = name.substring(0, 17) + "..";
  }
  let image = data.image;
  let explow = getxpbylevel(level);
  let prog = Math.floor(((curxp - explow) / (nextxp - explow)) * 570);

  let cmd = `!jimp -new "-w 670 -h 256 -c #23272A"
-composite "-new '-w 598 -h 192 -c #090A0B' -pos 35,35"
-composite2 "-url ${image || defimg} -resize 128,128 -pos 50,50"
-composite3 "-new '-w 570 -h 20 -c #484B4E' -pos 50,190"
-composite4 "-new '-w ${prog} -h 20 -c #62D3F5' -pos 50,190"
-print "-b _ -color white -text _${name}_ -pos 197,126"
-print2 "-color white -text ${isAdmin(uid) ? "Admin" : "Member"} -pos 199,159 -size 16"
-print3 "-color white -text '#${getrank(uid)}' -pos 620-twidth,40 -size 32"
-print4 "-color white -text '${numFormatter(curxp)} / ${numFormatter(nextxp)}' -pos 620-twidth,159 -size 16"
-print5 "-color white -text 'Level ${level}' -pos 620-twidth,139 -size 16"
-print6 "-color white -text 'Goblokbot 1991' -pos 665-twidth,235 -size 16"`;
  //-print6 "-color white -text '${count} messages' -pos 700-twidth,119 -size 16"`;

  return cmd;
}

//https://stackoverflow.com/a/32638472
function numFormatter(num, fixed = 4) {
  if (num === null) { return null; } // terminate early
  if (num === 0) { return '0'; } // terminate early
  fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
  var b = (num).toPrecision(2).split("e"), // get power
      k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
      c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed), // divide by power
      d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
      e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
  return e.replace(/\./g, ",");
}
