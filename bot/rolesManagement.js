const db = require("@utils/database");
const { gethashidfromuid, isAdmin } = require("./utility");
const roleDB = db.open("db/roles.json");
if (!roleDB.get().roles) roleDB.set("roles", []);

module.exports = {
  findRoleByID,
  findRoleByName,
  findRoleNameByID,
  findRoleIdByName,
  getUserRole,
  isRoleAllowed,
  checkFeatureRoleRequirement,
  findRole,
  assignRoleTo,
  deleteRoleFrom,
  roleList,
  addRole,
  removeRole,
  setRole
};

class RolesError extends Error {
  constructor(message) {
    super(message);
    this.name = "RolesError";
  }
}

function roleList() {
  return roleDB.get().roles;
}

function assignRoleTo(uid, roleIdOrName) {
  let role = findRole(roleIdOrName);
  if (!role)
    throw new RolesError("Role with id/name " + roleIdOrName + " not found");
  if (!role.assignable && !isAdmin(uid))
    throw new RolesError("Role with id/name " + roleIdOrName + " is not assignable");
  let userdb = db.open("db/user.json");
  let userdata = userdb.get()[gethashidfromuid(uid)];
  if (!userdata) userdata = userdb.get()[uid];
  if (!userdata) throw new RolesError("That user does not exist");
  if (!userdata.roles) userdata.roles = [];
  if (userdata.roles.filter((d) => d === role.id).length)
    throw new RolesError("That role is exist in your data");
  userdata.roles.push(role.id);
  userdb.set(gethashidfromuid(uid), userdata);
  userdb.save();
  return role;
}

function deleteRoleFrom(uid, roleIdOrName) {
  let role = findRole(roleIdOrName);
  if (!role)
    throw new RolesError("Role with id/name " + roleIdOrName + " not found");
  if (!role.assignable && !isAdmin(uid))
    throw new RolesError("Role with id/name " + roleIdOrName + " is not assignable");
  let userdb = db.open("db/user.json");
  let userdata = userdb.get()[gethashidfromuid(uid)];
  if (!userdata) userdata = userdb.get()[uid];
  if (!userdata) throw new RolesError("That user does not exist");
  if (!userdata.roles) userdata.roles = [];
  if (!userdata.roles.filter((d) => d === role.id).length)
    throw new RolesError("That role is not exist in your data");
  userdata.roles.splice(
    userdata.roles.findIndex((r) => r === role.id),
    1
  );
  userdb.set(gethashidfromuid(uid), userdata);
  userdb.save();
  return role;
}

function checkFeatureRoleRequirement(uid, cmdroles) {
  if (!cmdroles) return;
  if (isAdmin(uid)) return;
  if (isRoleAllowed(getUserRole(uid), cmdroles)) return;
  let msg =
    "You are not allowed to use this command." +
    "\n\nThis command requires following role(s):\n";
  for (let i = 0; i < cmdroles.length; i++) {
    msg += "- " + findRole(cmdroles[i]).name + "\n";
  }
  throw new RolesError(msg.trim());
}

function isRoleAllowed(target, source) {
  if (!target || !source) return false;
  for (let i = 0; i < source.length; i++) {
    let role = findRole(source[i]);
    if (!role) continue;
    if (target.filter((r) => r.id === role.id).length) return true;
  }
  return false;
}

function getUserRole(uid) {
  let out = [];
  let users = db.open("db/user.json").get();
  let userroles = users[gethashidfromuid(uid)].roles;
  if (!userroles) return null;
  userroles.forEach((roleid) => {
    out.push(findRoleByID(roleid));
  });
  return out;
}

function findRole(idOrName) {
  return typeof idOrName === "number" || !isNaN(idOrName)
    ? findRoleByID(parseInt(idOrName))
    : findRoleByName(idOrName);
}

function findRoleByID(id) {
  return roleDB.get().roles.find((role) => role.id === id);
}

function findRoleByName(name) {
  return roleDB
    .get()
    .roles.find(
      (role) => role.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
}

function findRoleNameByID(id) {
  return findRoleByID(id).name;
}

function findRoleIdByName(name) {
  return findRoleByName(name).id;
}

function addRole(name, assignable) {
  let roles = roleDB.get().roles;
  let id = !roles.length ? 1 : roleDB.get().roles.sort((r2, r1) => r1.id - r2.id)[0].id + 1;
  roleDB.append("roles", {
    id: id,
    name,
    assignable,
  });
  roleDB.save();
  return id;
}

function removeRole(roleIdOrName) {
  let role = findRole(roleIdOrName);
  if (!role)
    throw new RolesError("Role with id/name " + roleIdOrName + " not found");
  let roles = roleDB.get().roles;
  let idx = roles.findIndex((r) => r.id === role.id);
  let therole = roles[idx];
  roles.splice(idx, 1);
  roleDB.set("roles", roles);
  roleDB.save();
  return therole;
}

function setRole(roleIdOrName, name, value) {
  let role = findRole(roleIdOrName);
  if (!role)
    throw new RolesError("Role with id/name " + roleIdOrName + " not found");
  let roles = roleDB.get().roles;
  let idx = roles.findIndex((r) => r.id === role.id);
  let therole = roles[idx];
  if (name === "assignable") {
    therole.assignable = Boolean(value);
  } else { // name
    therole.name = value;
  }
  roleDB.set("roles", roles);
  roleDB.save();
  return therole;
}
