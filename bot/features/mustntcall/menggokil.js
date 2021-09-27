// https://img.favpng.com/12/19/12/emoticon-smiley-computer-icons-t-shirt-sunglasses-png-favpng-3vsrdQNcX3TSnVCkVA6pjuMwJ.jpg

module.exports = {
    data: {
      name: "Menggokil",
      description: "Kirim gambar menggokil",
      usage: "menggokil",
      CMD: "menggokil",
      ALIASES: []
    },
    run: (parsed, event, bot) => {
      if (!!parsed.arg) return null;
      var sendImageMessage = {
        type: "image",
        originalContentUrl: "https://img.favpng.com/12/19/12/emoticon-smiley-computer-icons-t-shirt-sunglasses-png-favpng-3vsrdQNcX3TSnVCkVA6pjuMwJ.jpg",
        previewImageUrl: "https://img.favpng.com/12/19/12/emoticon-smiley-computer-icons-t-shirt-sunglasses-png-favpng-3vsrdQNcX3TSnVCkVA6pjuMwJ.jpg"
      };
      return [sendImageMessage];
    }
  };
  