const { ArgsType } = require("@bot/command/args");
const rolesManagement = require("@bot/rolesManagement");
const { gethashidfromuid, gethashidfromkey, isAdmin } = require("@bot/utility");

module.exports = {
  data: {
    name: "Roles Goblokbot",
    description: "Buat assign/remove roles",
    usage: "[@bot/!] roles",
    CMD: "roles",
    ALIASES: ["t"],
    ARGS: {
      command_type: {
        required: true,
        type: ArgsType.STRING,
        description: "Nama command (assign / remove)",
        modify(value) {
          return value.toLowerCase();
        },
        constraints: [
          [
            (name) =>
              [
                "assign",
                "remove",
                "list",
                "add",
                "delete",
                "give",
                "set",
                "inrole"
              ].includes(name),
            "Invalid command",
          ],
        ],
      },
      command_value: {
        required: true,
        type: [ArgsType.NUMBER, ArgsType.STRING],
        description: "Nama / id role",
        default: "",
        "+": true,
        constraints: [
          [
            (name, args) => args.command_type != "list" && args.command_value || args.command_type === "list" && !args.command_value,
            "That command requires value",
          ],
        ],
      },
      "--assignable": {}
    },
  },
  run: (parsed, event, bot) => {
    let commandtype = parsed.args.command_type;
    let commandvalue = parsed.args.command_value;
    let uid = event.source.userId;
    let out = "";

    switch (commandtype) {
      case "assign":
        return toMessage(
          `Role ${
            rolesManagement.assignRoleTo(uid, commandvalue).name
          } is added to your data.`
        );
      case "remove":
        return toMessage(
          `Role ${
            rolesManagement.deleteRoleFrom(uid, commandvalue).name
          } is removed from your data.`
        );
      case "list":
        return toMessage(getRoleList());
      case "add":
        if (!isAdmin(uid)) throw new Error("Forbidden");
        let assignable = parsed.args.assignable;
        let name = parsed.args.command_value;
        rolesManagement.addRole(name, assignable);
        return toMessage(`Role ${name} is added`);
      case "delete":
        if (!isAdmin(uid)) throw new Error("Forbidden");
        let therole = rolesManagement.removeRole(parsed.args.command_value);
        return toMessage(`Role ${therole.name} is removed`);
      case "give":
        if (!isAdmin(uid)) throw new Error("Forbidden");
      case "set":
        if (!isAdmin(uid)) throw new Error("Forbidden");
        let val = parsed.args.command_value.split(" ");
        let valid = val.shift();
        let valname = val.shift();
        let valvalue = val.join(" ");
        if (!valid || !valname || !valvalue) {
          throw new Error("This command requires role id/name, variable name, and its value");
        }
        valname = valname.toLowerCase();
        rolesManagement.setRole(valid, valname, valvalue);
        return toMessage(`Ok`);
      default:
        throw new Error("Invalid");
    }
  },
};

function getRoleList() {
  let roles = rolesManagement.roleList();
  let out = "Role List\n+ = Assignable\nUse `!roles assign <rolename/roleid>` to assign roles\n\n";
  roles.sort((a,b) => a.id-b.id).forEach((role) => {
    out += `- [${role.id}] `+ role.name + (role.assignable ? " (+)" : "") + "\n";
  });
  return out.trim();
}

function toMessage(msg) {
  if (!msg) throw new Error("Invalid");
  return {
    type: "text",
    text: msg,
  };
}
