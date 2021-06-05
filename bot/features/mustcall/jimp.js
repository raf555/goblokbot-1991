const Jimp = require("jimp");
const imgbb = require("./../../../service/imgbb");
const { parseArg } = require("./../../parser");

module.exports = (parsed, event) => {  
  if (parsed.args.compare) {
    return compare(parsed.args.compare);
  }

  return process(parsed.args).then(url => {
    let out = [
      {
        type: "image",
        originalContentUrl: url,
        previewImageUrl: url
      }
    ];

    if (parsed.args.out) {
      out.push({
        type: "text",
        text: "URL: " + url + "\n\nThe link will expire in 24 hours"
      });
    }
    return out;
  });
};

async function compare(val) {
  let val2 = parseArg(val);

  let url1, url2;
  if (Object.keys(val2).length > 0) {
    url1 = val2["url1"];
    url2 = val2["url2"];
  } else {
    val2 = val.split(/\s|,/);
    url1 = val2[0];
    url2 = val2[1];
  }

  let img1 = await Jimp.read({
    url: url1
  });
  let img2 = await Jimp.read({
    url: url2
  });

  let distance = Jimp.distance(img1, img2); // perceived distance
  let diff = Jimp.diff(img1, img2); // pixel difference

  let out;
  if (distance < 0.15 || diff.percent < 0.15) {
    out = "Images match: " + (1 - diff.percent) * 100 + "%";
  } else {
    out = "Images don't match: " + (1 - diff.percent) * 100 + "%";
  }

  return { type: "text", text: out };
}

async function process(args) {
  let image = await createImage(args);
  let buffer = (await image.getBufferAsync(Jimp.MIME_PNG)).toString("base64");

  let upload = await imgbb.upload({
    name: "jimptes" + Date.now(),
    base64string: buffer,
    expiration: 3600 * 24
  });
  let url = upload.url;
  return url;
}

async function createImage(args) {
  let url = args.url;
  delete args["url"];

  let image = await Jimp.read({
    url: url
  });

  //console.log(();

  let command = Object.keys(args);
  let tables = table();
  let tablekey = Object.keys(tables);

  for (let i = 0; i < command.length; i++) {
    let edit = command[i];
    let more = /(.*?)\d+/.test(edit) ? /(.*?)\d+/.exec(edit)[1] : null;
    
    if (tablekey.includes(edit)) {
      image = await tables[edit](image, args[edit]);
    } else {
      if (more && tablekey.includes(more)) {
        image = await tables[more](image, args[edit]);
      }
    }
  }

  return image;
}

function table() {
  return {
    rotate: rotate,
    invert: invert,
    greyscale: greyscale,
    resize: resize,
    print: print,
    composite: composite,
    quality: quality,
    scale: scale,
    crop: crop,
    mask: mask,
    mirror: mirror,
    brightness: brightness,
    contrass: contrass,
    blur: blur,
    opacity: opacity,
    pixelate: pixelate,
    posterize: posterize
  };
}

function pixelate(image, val) {
  let val2 = parseArg(val);

  let x, y, h, w, p;
  if (Object.keys(val2).length > 0) {
    x = Number(val2.x);
    y = Number(val2.y);
    h = Number(val2.h);
    w = Number(val2.w);
    p = Number(val2.p);
    return image.pixelate(p, x, y, w, h);
  } else {
    if (typeof val === "string" && !isNaN(val)) {
      p = Number(val);
    }
    return image.pixelate(p);
  }
}

function posterize(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  return image.posterize(val);
}

function opacity(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  return image.opacity(val);
}

function blur(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  return image.blur(val);
}

function contrass(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  return image.contrass(val);
}

function brightness(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  return image.brightness(val);
}

function mirror(image, val) {
  if (val === 1){
    return image.mirror(true, false);
  }
    
  val = parseArg(val);

  return image.mirror(!!val.y, !!val.x);
}

function mask(image, val) {
  val = parseArg(val);

  let pos = val.pos;

  let x, y;
  if (pos) {
    pos = pos.split(",");
    x = Number(pos[0]);
    y = Number(pos[1]);
  }

  return createImage(val).then(image2 => {
    return image.mask(image2, x, y);
  });
}

function crop(image, val) {
  val = parseArg(val);

  let x = Number(val.x),
    y = Number(val.y),
    h = Number(val.h),
    w = Number(val.w);

  return image.crop(x, y, w, h);
}

function scale(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  return image.scale(val);
}

function quality(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  return image.quality(val);
}

function composite(image, val) {
  val = parseArg(val);

  let pos = val.pos;

  let x, y;
  if (pos) {
    pos = pos.split(",");
    x = Number(pos[0]);
    y = Number(pos[1]);
  }

  return createImage(val).then(image2 => {
    return image.composite(image2, x, y);
  });
}

async function print(image, val) {
  val = parseArg(val);

  let keys = Object.keys(val);

  let font;
  let text = val.text;

  let size;
  if (keys.includes("size")) {
    size = val["size"];
  } else {
    size = "32";
  }

  let color;
  if (keys.includes("color")) {
    color = val["color"].toUpperCase();
  } else {
    color = "BLACK";
  }

  let fontname = `FONT_SANS_${size}_${color}`;
  font = await Jimp.loadFont(Jimp[fontname]);

  if (keys.includes("top")) {
    image = await image.print(
      font,
      0,
      0,
      {
        text: val.top,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP
      },
      image.bitmap.width,
      image.bitmap.height
    );
  }

  if (keys.includes("middle")) {
    image = await image.print(
      font,
      0,
      0,
      {
        text: val.middle,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      },
      image.bitmap.width,
      image.bitmap.height
    );
  }

  if (text) {
    image = await image.print(
      font,
      0,
      0,
      {
        text: text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
      },
      image.bitmap.width,
      image.bitmap.height
    );
  }

  return image;
}

function invert(image, val) {
  return image.invert();
}

function greyscale(image, val) {
  return image.greyscale();
}

function resize(image, val) {
  let xy = val.split(",");

  let x = xy[0],
    y = xy[1];

  if (x.toLowerCase() === "auto") {
    x = Jimp.AUTO;
  } else {
    if (!isNaN(x)) {
      x = Number(x);
    }
  }

  if (y.toLowerCase() === "auto") {
    y = Jimp.AUTO;
  } else {
    if (!isNaN(y)) {
      y = Number(y);
    }
  }

  return image.resize(x, y);
}

function rotate(image, val) {
  if (typeof val === "string" && !isNaN(val)) {
    val = Number(val);
  }
  val *= -1;
  return image.rotate(val);
}
