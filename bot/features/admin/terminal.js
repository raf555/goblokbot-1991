const { promisify } = require("util");
const exec = promisify(require("child_process").exec);

module.exports = {
  data: {
    name: "Terminal",
    description: "Run terminal cmd from chat",
    help: "",
    createdAt: 0,
    CMD: "terminal",
    ALIASES: []
  },
  run: async (parsed, event, bot) => {
    let cmd = parsed.arg;
    const { stdout, stderr } = await exec(cmd);
    return {
      type: "text",
      text: "stdout:\n" + stdout + "\nstderr:\n" + stderr
    };
  }
};
