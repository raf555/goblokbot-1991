const db = require("@utils/database");

module.exports = function(parsed, event, bot) {
    let msg = parsed.fullMsg

    if (
        // msg[0].toLowerCase() == "g" &&
        // msg.length > 2 &&
        // msg.match(/(r)\1\1+/i)
        msg.match("menggokil")
    ) {
        return {
        type: "image",
        originalContentUrl: "https://img.favpng.com/12/19/12/emoticon-smiley-computer-icons-t-shirt-sunglasses-png-favpng-3vsrdQNcX3TSnVCkVA6pjuMwJ.jpg", //"https://i.ibb.co/ChLFsXr/184101.jpg",
        previewImageUrl: "https://img.favpng.com/12/19/12/emoticon-smiley-computer-icons-t-shirt-sunglasses-png-favpng-3vsrdQNcX3TSnVCkVA6pjuMwJ.jpg",
        cmd: "menggokil"
        };
    }
    // https://img.favpng.com/12/19/12/emoticon-smiley-computer-icons-t-shirt-sunglasses-png-favpng-3vsrdQNcX3TSnVCkVA6pjuMwJ.jpg
}