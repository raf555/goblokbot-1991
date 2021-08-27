module.exports = {
  data: {
    name: "Help Command",
    description: "Buat ngirim cara penggunaan fitur",
    usage: "[@bot/!] help <feature-name>?",
    CMD: "help",
    ALIASES: []
  },
  run: help
};

function help(parsed, event, bot) {
  //let data = require("./../")(true);
  let { data } = bot;

  let q = parsed.arg.toLowerCase();

  if (q) {
    return helpcmd(q, data);
  }

  let names = []
    .concat(Object.keys(data.mustcall))
    //.map(name => {
    // if (data.mustcall[name].ADMIN) {
    //  name += " (admin)";
    //}
    //  return "!" + name;
    //})
    .concat(Object.keys(data.mustntcall));

  return {
    type: "text",
    text: "Usage: !help <feature-name>\n\nList:\n" + names.sort().join("\n")
  };
}

function helpcmd(q, data) {
  let names = []
    .concat(Object.keys(data.mustcall))
    .concat(Object.keys(data.mustntcall));

  if (names.indexOf(q) === -1) {
    return {
      type: "text",
      text: "Not found"
    };
  }

  let mustcall = Object.keys(data.mustcall);
  let mustntcall = Object.keys(data.mustntcall);

  let k = mustntcall.indexOf(q) !== -1 ? "mustntcall" : "mustcall";

  let cmddata = data[k][q];

  return {
    type: "flex",
    altText: "help - " + q,
    contents: {
      type: "carousel",
      contents: [helpjson(cmddata, k === "mustcall"), legendjson()]
    }
  };
}

function helpjson(data, useprefix) {
  let {
    name,
    description: desc,
    CMD: cmd,
    ALIASES: aliases,
    usage,
    DISABLED: disabled,
    ADMIN: admin
  } = data;

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
              text: name,
              size: "lg",
              weight: "bold"
            },
            {
              type: "text",
              text: desc,
              size: "sm",
              wrap: true
            },
            {
              type: "separator",
              margin: "sm"
            },
            {
              type: "text",
              text: "Disabled: " + (disabled || "false"),
              size: "sm"
            },
            {
              type: "text",
              text: "Admin Only: " + (admin || "false"),
              size: "sm"
            },
            /*{
              type: "text",
              text: "Use @bot / prefix: " + (useprefix || "false"),
              size: "sm"
            },*/
            {
              type: "separator",
              margin: "sm"
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "Command:",
                      size: "sm"
                    },
                    {
                      type: "text",
                      text: cmd,
                      size: "sm",
                      align: "end",
                      weight: "bold"
                    }
                  ]
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "Alt/Alias:",
                      size: "sm"
                    },
                    {
                      type: "text",
                      text: aliases.join(", ") || "-",
                      size: "sm",
                      align: "end",
                      weight: "bold"
                    }
                  ]
                }
              ],
              margin: "sm"
            }
          ]
        },
        {
          type: "separator",
          margin: "sm"
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "Usage:",
              weight: "bold"
            },
            {
              type: "text",
              text: usage || "blom ada",
              wrap: true,
              size: "sm",
              margin: "md"
            }
          ],
          margin: "sm"
        }
      ]
    }
  };
}

function legendjson() {
  return {
    type: "bubble",
    size: "kilo",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "Legend",
          size: "lg",
          weight: "bold"
        },
        {
          type: "separator",
          margin: "sm"
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "() = comment",
              wrap: true,
              size: "sm"
            },
            {
              type: "text",
              text: "[] = dari pilihan, harus ada",
              wrap: true,
              size: "sm"
            },
            {
              type: "text",
              text: "[]? = ^^^, boleh gaada",
              wrap: true,
              size: "sm"
            },
            {
              type: "text",
              text: "<> = bebas tp harus ada",
              wrap: true,
              size: "sm"
            },
            {
              type: "text",
              text: "<>? = bebas boleh gada",
              wrap: true,
              size: "sm"
            },
            {
              type: "separator",
              margin: "sm"
            },
            {
              type: "text",
              text: "{} = arguments, boleh gada",
              wrap: true,
              size: "sm"
            },
            {
              type: "text",
              text: "{}! = arguments, wajib ada",
              wrap: true,
              size: "sm"
            },
            {
              type: "text",
              text: "<>!/()! = wajib ada jika ber-arguments",
              wrap: true,
              size: "sm"
            },
            {
              type: "separator",
              margin: "sm"
            },
            {
              type: "text",
              text: "* = apapun",
              wrap: true,
              size: "sm"
            },
            {
              type: "text",
              text: "/ = atau",
              wrap: true,
              size: "sm"
            },
            {
              type: "text",
              text: "! = harus ada",
              wrap: true,
              size: "sm"
            },
            {
              type: "text",
              text: "? = boleh gada",
              wrap: true,
              size: "sm"
            }
          ],
          margin: "sm"
        },
        {
          type: "separator",
          margin: "sm"
        }
      ]
    }
  };
}
