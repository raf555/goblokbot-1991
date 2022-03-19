const { ArgsType } = require("@bot/command/args");
const discordCDN = require("@utils/discordCDN");

module.exports = {
  data: {
    name: "Discord CDN Command",
    description: "Command buat manage Discord CDN",
    usage: "",
    ADMIN: true,
    CMD: "discordCDN",
    ALIASES: [],
    ARGS: {
      "command": {
        required: true,
        constraints: [[(value) => ["get", "delete"].includes(value.toLowerCase()), "Invalid command"]],
        description: "Command (get / delete)"
      },
      "value": {
        required: true,
        "+": true,
        description: "Argumen (id / url)"
      }
    }
  },
  run: async (parsed, event, bot) => {
    if (parsed.args.command === "get") {
      let data = discordCDN.getFile(parsed.args.value);
      if (!data) {
      return {
          type: "text",
          text: "Not found or deleted"
        }
      }
      delete data.uploadedId;
      return {
        type: "text",
        text: JSON.stringify(data, undefined, 2)
      }
    }
    
    if (parsed.args.command === "delete") {
      let data = discordCDN.getFile(parsed.args.value);
      if (!data) {
      return {
          type: "text",
          text: "Not found or deleted"
        }
      }
      await discordCDN.deleteFile(data.id);
      return {
        type: "text",
        text: "Deleted"
      }
    }
  }
}