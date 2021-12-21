const db = require("@utils/database");
const imageSearch = require("google-images");
const axios = require("axios");
const stringSimilarity = require("string-similarity");
const argstype = require("@bot/command/args/type");

// init
let papkey = process.env.pap_key.split(",");
let key1 = papkey[0];
let key2 = papkey[1];
let key3 = papkey[2];
let key4 = papkey[3];

let apikey = process.env.pap_api_key.split(",");
let api1 = apikey[0];
let api2 = apikey[1];
let api3 = apikey[2];
let api4 = apikey[3];

let key = [key1, key2, key3, key4];
let api = [api1, api2, api3, api4];

function invalidimage(he) {
  return (
    he.url.match(/x-raw-image:\/\/\//) ||
    he.thumbnail.url.match(/x-raw-image:\/\/\//)
  );
}

module.exports = {
  data: {
    name: "PAP cmd",
    description: "Command buat ambil satu/lebih gambar dari google",
    usage:
      "[@bot/!] pap {options} <query>" +
      "\n\noptions:" +
      "\n-n <n> ?: buat nampilin gambar berjumlah n (maks 12)",
    CMD: "pap",
    ALIASES: ["p"],
    ARGS: {
      "-n": {
        required: false,
        type: argstype.NUMBER,
        description: "Jumlah gambar yang di-pap",
        constraints: [[n => n < 12 && n > 0, "n must be lower than 12 and greater than 0"]]
      }
    }
  },
  run: pap
};

function pap(parsed, event, bot) {
  if (!parsed.arg) return false;

  const setting = db.open("bot/setting.json").get();
  const klien = new imageSearch(key[setting.imgapi], api[setting.imgapi]);

  let query = parsed.arg;
  let options = { page: 1 };

  return klien.search(parsed.arg, options).then(async he => {
    if (he.length === 0) {
      return {
        type: "text",
        text: "Not found"
      };
    }

    if (parsed.args.n) {
      return nimages(parsed, he);
    }

    let isb = isban(parsed);
    if (isb) {
      return {
        type: "text",
        text: "Kata tersebut 「 " + isb + " 」 telah di-ban oleh Admin"
      };
    }

    let xdlmao = Math.floor(Math.random() * he.length);

    if (parsed.args.t) {
      xdlmao = 0;
    }

    let tries = 0;

    while (invalidimage(he[xdlmao]) && tries < 10) {
      xdlmao = Math.floor(Math.random() * he.length);
      tries++;
    }

    /*
    NSFW detector
    if (await isnsfw(he[xdlmao].thumbnail.url)) {
      return bot.function
        .exec(
          "@bot ban user " + finduserkey(event.source.userId) + " 5 menit",
          event
        )
        .then(reply => {
          reply.unshift({
            type: "text",
            text: "Gambar jorok"
          });
          return reply;
        });
    }*/

    //console.log(he)
    //console.log(he[xdlmao])

    let gambar = he[xdlmao].url.replace("http://", "https://");
    let gambart = he[xdlmao].thumbnail.url.replace("http://", "https://");

    //console.log(gambar)
    let send = [
      {
        type: "image",
        originalContentUrl: gambar,
        previewImageUrl: gambart
      }
    ];
    if (parsed.args.out || parsed.args.url) {
      send.push({
        type: "text",
        text: gambar
      });
    }
    return send;
  });
}

function finduserkey(id) {
  let dbz = db.open("db/user.json");
  let fi = Object.values(dbz.get()).filter(d => d.id === id);

  if (fi.length > 0) {
    return fi[0].key;
  }
  return null;
}

function isban(parsed) {
  // cek ban
  let dbz = db.open("db/banpap.json");
  let dbg = dbz.get();
  for (let i = 0; i < Object.keys(dbg).length; i++) {
    if (dbz.get(Object.keys(dbg)[i]) == 1) {
      let reg = new RegExp(Object.keys(dbg)[i], "i");
      let matches = stringSimilarity.findBestMatch(
        Object.keys(dbg)[i],
        parsed.arg.toLowerCase().split(" ")
      );
      //if (query.match(reg) && dbz.get(Object.keys(dbg)[i]) == 1) {
      if (matches.bestMatch.rating >= 0.9) {
        return Object.keys(dbg)[i];
      }
    }
  }
  return null;
}

function isnsfw(url) {
  return new Promise((resolve, reject) => {
    axios
      .get("https://api.sightengine.com/1.0/check.json", {
        params: {
          url: url,
          models: "nudity",
          api_user: process.env.api_nudcek_user,
          api_secret: process.env.api_nudcek_key
        }
      })
      .then(function(response) {
        let { data } = response;
        let { nudity } = data;
        resolve(
          nudity.raw >= Math.max(nudity.partial, nudity.safe) ||
            nudity.partial >= Math.max(nudity.raw, nudity.safe)
        );
      })
      .catch(function(error) {
        // handle error
        if (error.response) console.log(error.response.data);
        else console.log(error.message);
        reject(new Error("NSFW check failed"));
        //resolve(false);
      });
  });
}

function nimages(parsed, he) {
  let isb = isban(parsed);
  if (isb) {
    return {
      type: "text",
      text: "Kata tersebut 「 " + isb + " 」 telah di-ban oleh Admin"
    };
  }

  let n = parsed.args.n % 12;

  let crsl = {
    type: "flex",
    altText: "pap",
    contents: {
      type: "carousel",
      contents: []
    }
  };

  shuffle(he);

  for (let i = 0; i < Math.min(he.length, n); i++) {
    if (invalidimage(he[i])) {
      continue;
    }
    crsl.contents.contents.push({
      type: "bubble",
      size: "micro",
      hero: {
        type: "image",
        url: he[i].url.replace("http://", "https://"),
        size: "full",
        aspectMode: "fit",
        action: {
          type: "uri",
          uri: he[i].url.replace("http://", "https://")
        }
      }
    });
  }

  return crsl;
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ];
  }

  return array;
}
