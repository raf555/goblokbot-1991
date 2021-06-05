module.exports = () => {
  return {
    type: "flex",
    altText: "Bot - Request Feature",
    contents: {
      type: "bubble",
      size: "nano",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "Request",
              uri: "https://gblkbt1991.glitch.me/command"
            }
          }
        ]
      },
      styles: {
        footer: {
          separator: false
        }
      }
    }
  };
};
