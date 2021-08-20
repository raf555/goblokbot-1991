const { promisify } = require("util");
const exec = promisify(require("child_process").exec);

/* VERY DANGEROUS FEATURE, USE WITH CAUTION */

module.exports = {
  data: {
    name: "Terminal",
    description: "Run terminal cmd from chat",
    usage: "[@bot/!] terminal <command>",
    ADMIN: true,
    CMD: "terminal",
    ALIASES: []
  },
  run: async (parsed, event, bot) => {
    if (event.source.userId !== process.env.admin_id) {
      throw new Error("Admin only");
    }

    let cmd = parsed.arg;
    const { stdout, stderr } = await exec(cmd);
    return {
      type: "text",
      text:
        "stdout:\n" +
        JSON.stringify(stdout) +
        "\nstderr:\n" +
        JSON.stringify(stderr)
    };
  }
};
