const { ArgsType } = require("@bot/command/args");

module.exports = {
  data: {
    name: "Test command",
    description: "Command buat tes",
    help: "!_",
    CMD: "_",
    ALIASES: [],
    ARGS: {
      "-a": {
        type: ArgsType.ARRAY([
          ArgsType.ARRAY([
            ArgsType.STRING,
            ArgsType.DATE,
            ArgsType.ARRAY([ArgsType.JSON, ArgsType.NUMBER, ArgsType.DATE]),
            ArgsType.NUMBER,
            ArgsType.ARRAY(ArgsType.STRING),
          ])
        ])
      },
      "-c": {
        require: ["-d", "-e"]
      },
      "-z" : {
        type:ArgsType.STRING,
        modify(value) {
          return value.toLowerCase() + "uuu"
        }
      }
    }
  },
  run: (parsed, event, bot) => {
    return {
      type: "text",
      text: JSON.stringify(
        Object.assign(parsed.args, { _: parsed.arg }),
        undefined,
        1
      ),
      nosave: true
    };
  }
};
