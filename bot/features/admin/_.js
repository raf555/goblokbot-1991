const { ArgsType } = require("@bot/command/args");

module.exports = {
  data: {
    name: "Test command",
    description: "Command buat tes",
    help: "!_",
    CMD: "_",
    ALIASES: [],
    ARGS: {
      "aa": {
        type: Number,
        "+": 2
      },
      "tes1": {
        type: ArgsType.STRING,
      },
      "tes2": {
        type: ArgsType.NUMBER,
        "+": true,
        toArray: true
      },
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
      "-aa" : {
        type: ArgsType.ARRAY([String, Date, Boolean])
      },
      "-c": {
        require: ["-d", "-e"],
        //modify: value => parseInt(value)
      },
      "-z" : {
        type: [ArgsType.DATE, ArgsType.NUMBER],
        modify(value) {
          return value.toString()
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
