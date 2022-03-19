const { getprog, getxpbylevel } = require("@bot/socialcredit");

module.exports = {
  data: {
    name: "Levels Command",
    description: "Buat ngirim info leveling",
    usage: "[@bot/!] levels",
    CMD: "levels",
    ALIASES: ["leveling"]
  },
  run: leveling
};

function leveling(parsed, event, bot) {
  let out = [];
  for (let i = 0; i < 12; i++) out.push(makebubble(i + 1));
  return {
    type: "flex",
    altText: "Leveling social credit",
    contents: {
      type: "carousel",
      contents: out
    }
  };
}

function makebubble(x) {
  let max = x * 10;
  let bubble = {
    type: "bubble",
    size: "kilo",
    body: {
      type: "box",
      layout: "vertical",
      contents: [],
      spacing: "xs"
    }
  };
  bubble.body.contents.push(
    {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "Level"
            }
          ],
          width: "40px"
        },
        {
          type: "separator"
        },
        {
          type: "text",
          text: "Total credit required",
          wrap: true,
          size: "xxs"
        },
        {
          type: "separator"
        },
        {
          type: "text",
          text: "Credit needed to level up",
          wrap: true,
          size: "xxs"
        }
      ],
      spacing: "md"
    },
    {
      type: "separator"
    }
  );

  for (let i = x === 1 ? max - 10 : max - 9; i <= max; i++) {
    bubble.body.contents.push(
      {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: i.toString()
              }
            ],
            width: "40px"
          },
          {
            type: "separator"
          },
          {
            type: "text",
            text: getxpbylevel(i).toString(),
            wrap: true
          },
          {
            type: "separator"
          },
          {
            type: "text",
            text: getprog(i).toString(),
            wrap: true
          },
        ],
        spacing: "md"
      },
      {
        type: "separator"
      }
    );
  }

  return bubble;
}
