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
  if (event.source.userId !== process.env.admin_id) {
    return null;
  }

  let params = {
    textMessage: "Ada deadline apa saja untuk if 19 sejauh ini"
  };

  let data = await axios
    .get(
      endpoint + "?action=getEventsByDuration&param=" + JSON.stringify(params)
    )
    .then(data => data.data.result);

  let regex = /\[IF\s?19\]\s?/;
  let now = Date.now();

  let bubbles = data
    .filter(e => e.end * 1000 > now && regex.test(e.name))
    .map(e => {
      e.name = e.name.replace(regex, "");
      return makebubble(e);
    });

  let start = parsed.args.next ? 12 : 0;

  if (start > bubbles.length) {
    return {
      type: "text",
      text: "No more assignment"
    };
  }

  return {
    type: "flex",
    altText: "Tugas Kuliah",
    contents: {
      type: "carousel",
      contents: bubbles.slice(start, start + 12)
    }
  };
}

function datetojam(date) {
  let jam = appendzero(date.getHours());
  let mnt = appendzero(date.getMinutes());

  return `${jam}.${mnt}`;
}

function datetotgl(date) {
  let hari = date.toLocaleDateString("ID", { weekday: "long" });
  let tgl = appendzero(date.getDate());
  let bln = appendzero(date.getMonth() + 1);
  let thn = date.getFullYear();

  return `${hari}, ${tgl}-${bln}-${thn}`;
}

function appendzero(n) {
  if (typeof n === "string") {
    n = parseInt(n);
  }

  return n < 10 ? "0" + n : n.toString();
}

function makebubble(data) {
  let date = convertTZ(new Date(data.end * 1000), "Asia/Jakarta");
  let tgl = datetotgl(date);
  let jam = datetojam(date);

  return {
    type: "bubble",
    size: "kilo",
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
              text: data.name,
              size: "lg",
              wrap: true,
              align: "center",
              weight: "bold"
            },
            {
              type: "separator"
            },
            {
              type: "text",
              text: tgl,
              align: "center",
              size: "sm"
            },
            {
              type: "text",
              text: jam,
              align: "center",
              size: "sm"
            }
          ],
          spacing: "xs"
        },
        {
          type: "separator"
        },
        {
          type: "text",
          text: data.desc.trim(),
          wrap: true,
          size: "sm"
        }
      ],
      spacing: "sm"
    }
  };
}
