module.exports = () => {
  return {
    type: "flex",
    altText: "GoblokBot1991 - Apps",
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
              label: "Open",
              uri: "line://app/1654302182-vW9jXemG"
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
