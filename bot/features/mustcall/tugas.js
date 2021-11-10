const endpoint = process.env.api_tugas_kuliah;
const axios = require("axios");
const { convertTZ } = require("@bot/utility");

module.exports = {
  data: {
    name: "Tugas Command",
    description: "Buat ngirim tugas kuliah gw",
    usage: "[@bot/!] tugas",
    CMD: "tugas",
    ALIASES: []
  },
  run: (parsed, event, bot) =>
    tugas(parsed, event, bot).then(reply =>
      Object.assign(reply, { nosave: true })
    )
};

async function tugas(parsed, event, bot) {
  /* default is 2 week ahead */
  const week = 2;

  if (event.source.userId !== process.env.admin_id) {
    return null;
  }

  let params = {
    textMessage: "Ada deadline apa saja untuk if 19 sejauh ini",
    days: 9999
  };

  let data = await axios
    .get(
      endpoint + "?action=getEventsByDuration&param=" + JSON.stringify(params)
    )
    .then(data => data.data.result);

  let regex = /\[IF\s?19\]\s?/;
  let now = Date.now();

  let weekcon = e =>
    parsed.args.all || parsed.arg
      ? true
      : e.end <= now / 1000 + week * 7 * 24 * 3600;
  let querycon = e => {
    let a = parsed.arg.toLowerCase();
    let b = e.name.toLowerCase();
    return parsed.arg ? b.startsWith(a) || new RegExp(a).test(b) : true;
  };

  data = data
    .filter(e => {
      return (
        !e.name.toLowerCase().endsWith("(matkul pilihan)") &&
        querycon(e) &&
        weekcon(e) &&
        e.end * 1000 > now &&
        regex.test(e.name)
      );
    })
    .map(e => {
      e.name = e.name.replace(regex, "");
      return e;
    });

  return {
    type: "flex",
    altText: "Tugas Kuliah",
    contents: makeBubble(data)
  };
}

function getHari(ts) {
  return new Date(ts).toLocaleString("id-ID", { weekday: "long" });
}

function getTglPendek(ts) {
  return new Date(ts).toLocaleString("id-ID", {
    day: "numeric",
    month: "short"
  });
}

function getJam(ts) {
  return new Date(ts).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function makeBubble(data) {
  let bubble = {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [],
      spacing: "sm"
    }
  };
  let day = {};

  for (let i = 0; i < data.length; i++) {
    let tugas = data[i];
    tugas.end =
      convertTZ(new Date(tugas.end * 1000), "Asia/Jakarta").getTime() / 1000;
    let ts = tugas.end * 1000;
    let tglnya = new Date(ts).getDate().toString();
    if (!day[tglnya]) {
      day[tglnya] = makeDateBubble(ts);
    }
    if (day[tglnya].contents[2].contents.length) {
      day[tglnya].contents[2].contents.push({
        type: "separator"
      });
    }
    day[tglnya].contents[2].contents.push(makeTugasBubble(data[i]));
  }

  let key = Object.keys(day);
  for (let i = 0; i < key.length; i++) {
    if (i > 0) {
      bubble.body.contents.push({
        type: "separator"
      });
    }
    bubble.body.contents.push(day[key[i]]);
  }

  return bubble;
}

function makeDateBubble(ts) {
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            size: "sm",
            text: getHari(ts),
            weight: "bold",
            align: "end"
          },
          {
            type: "text",
            size: "sm",
            text: getTglPendek(ts),
            weight: "bold",
            align: "end"
          }
        ],
        width: "60px"
      },
      {
        type: "separator"
      },
      {
        type: "box",
        layout: "vertical",
        contents: [],
        spacing: "xs"
      }
    ],
    spacing: "md"
  };
}

function makeTugasBubble(data) {
  return {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "text",
        text: data.name,
        size: "sm",
        weight: "bold",
        wrap: true
      },
      {
        type: "text",
        text: getJam(data.end * 1000),
        size: "xs",
        margin: "none",
        weight: "bold"
      },
      {
        type: "text",
        text: data.desc.trim() || "-",
        margin: "xs",
        size: "xs",
        wrap: true
      }
    ]
  };
}
