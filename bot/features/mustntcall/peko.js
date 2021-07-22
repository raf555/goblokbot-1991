module.exports = {
  data: {
    name: "Peko",
    description: "Command buat ngirim suara pekora",
    help: "",
    createdAt: 0,
    CMD: "peko",
    ALIASES: []
  },
  run: (parsed, event) => {
    var audio = [
      [
        "https://cdn.glitch.com/d62336d4-8f62-47f6-b23f-8fc7535e2607%2FPEKOPEKOPEKOPEKO.m4a",
        2000
      ],
      [
        "https://cdn.glitch.com/d62336d4-8f62-47f6-b23f-8fc7535e2607%2FIt's%20me%20Pekora!.m4a",
        1000
      ],
      [
        "https://cdn.glitch.com/d62336d4-8f62-47f6-b23f-8fc7535e2607%2Fhahaha.m4a",
        1000
      ],
      [
        "https://cdn.glitch.com/d62336d4-8f62-47f6-b23f-8fc7535e2607%2Fhahahaha.m4a",
        1000
      ]
    ];
    var rand = angkaAcak(0, audio.length - 1);
    let arg = parsed.arg.split(" ");
    if (parsed.args.i || arg.length > 1) {
      if (arg.length > 1) {
        let n = parseInt(arg[1]);
        if (n >= 0 && n < 4) {
          rand = n;
        }
      } else {
        rand = parseInt(parsed.args.i);
      }
    }
    return {
      type: "audio",
      originalContentUrl: audio[rand][0],
      duration: audio[rand][1],
      sender: {
        name: "Pekora",
        iconUrl: "https://image.prntscr.com/image/KE05E8qcTayuf_OjijR9gQ.png"
      }
    };
  }
};

function angkaAcak(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
