const db = require("@utils/database");
const { angkaAcak, gethashidfromuid } = require("./utility");

module.exports = {
  addSocialCredit,
  addMoreSocialCredit,
  getxpbylevel,
  getlevelbyxp,
  getrank,
  getranks,
  getscdata
};

const constant = 0.09;

function getgap() {
  return angkaAcak(30000, 60000);
}

function addMoreSocialCredit(id) {
  const scdb = db.open("db/socialcredit.json");
  const user = db.open("db/user.json");
  const now = Date.now();

  id = gethashidfromuid(id, user.get());
  if (!id) return;

  let data = scdb.get(id);

  if (!data) {
    scdb.set(id, {
      xp: 0,
      level: 0,
      last: 0,
      lastbonus: 0,
      count: 0
    });
    data = scdb.get(id);
  }

  if (now <= data.lastbonus + getgap()) return;

  let xp = angkaAcak(25, 75);
  let curxp = data.xp;
  let acc = curxp + xp;
  let newlevel = getlevelbyxp(acc);

  let changelvl = newlevel !== data.level;

  scdb.set(id, {
    xp: acc,
    level: newlevel,
    last: data.last,
    lastbonus: now,
    count: data.count || 0
  });
  scdb.save();

  let out = "";
  if (changelvl) {
    if (newlevel <= data.level) {
      out = user.get(id).name + " has leveled down to level " + newlevel;
    } else {
      out = user.get(id).name + " has leveled up to level " + newlevel;
    }
  }

  let outobj = {
    xp: acc,
    level: newlevel,
    count: data.count + 1,
    levelchange: changelvl,
    message: out,
    messageobj: {
      type: "text",
      text: out
    }
  };

  return outobj;
}

function addSocialCredit(id, custom = 0) {
  const scdb = db.open("db/socialcredit.json");
  const user = db.open("db/user.json");
  const now = Date.now();

  id = gethashidfromuid(id, user.get());
  if (!id) return;

  let data = scdb.get(id);

  if (!data) {
    scdb.set(id, {
      xp: 0,
      level: 0,
      last: 0,
      lastbonus: 0,
      count: 0
    });
    data = scdb.get(id);
  }

  if (!custom && now <= data.last + getgap()) return;

  let xp = custom ? custom : angkaAcak(10, 25);
  let curxp = data.xp;
  let acc = curxp + xp;
  let newlevel = getlevelbyxp(acc);

  let changelvl = newlevel !== data.level;

  scdb.set(id, {
    xp: acc,
    level: newlevel,
    last: now,
    lastbonus: data.lastbonus,
    count: (data.count || 0) + 1
  });
  scdb.save();

  let out = "";
  if (changelvl) {
    if (newlevel <= data.level) {
      out = user.get(id).name + " has leveled down to level " + newlevel;
    } else {
      out = user.get(id).name + " has leveled up to level " + newlevel;
    }
  }

  let outobj = {
    xp: acc,
    level: newlevel,
    count: data.count + 1,
    levelchange: changelvl,
    message: out,
    messageobj: {
      type: "text",
      text: out
    }
  };

  return outobj;
}

function getlevelbyxp(xp) {
  return Math.floor(Math.sqrt(xp) * constant) || 0;
}

function getxpbylevel(lvl) {
  return Math.ceil((lvl / constant) ** 2);
}

function getscdata(id) {
  return getranks().filter(d => d.uid === id)[0];
}

function getrank(id) {
  let i = getranks().findIndex(d => d.uid === id);
  return i === -1 ? 999 : i + 1;
}

function getranks() {
  const scdb = db.open("db/socialcredit.json");
  const user = db.open("db/user.json");
  let keys = Object.keys(scdb.get());

  let out = [];
  Object.values(scdb.get()).forEach((sc, i) => {
    let ud = user.get(keys[i]);
    out.push({
      name: ud.name,
      image: ud.image,
      id: keys[i],
      uid: ud.id,
      level: sc.level,
      xp: sc.xp,
      count: sc.count || 0
    });
  });

  return out.sort((b, a) => a.xp - b.xp);
}
