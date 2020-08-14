let axios = require("axios");
let cheerio = require("cheerio");
let mongoose = require("mongoose");
let db = require("../models");
require("dotenv").config();

mongoose.Promise = Promise;

mongoose.connect(process.env.TWICE_REMOVED_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let mongooseConnection = mongoose.connection;

mongooseConnection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongooseConnection.once("open", function () {
  console.log("Connected to Database");
});

// ==============================================
// Routes
// ==============================================

module.exports = (app) => {
  app.get("/", (req, res) => {
    var testItem = [
      {
        headline: "Test Headline",
        url:
          "https://www.wired.com/story/want-free-coding-lessons-twitch-real-time/",
        imageURL:
          "https://i.pinimg.com/originals/6e/5f/0d/6e5f0db3986c094e3b4c22d12b01e764.jpg",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer diam dui, elementum eu auctor id, pharetra rutrum justo. Aliquam dapibus tincidunt vulputate. Nullam a mi mollis, pharetra nisi dignissim, elementum mi. Integer ullamcorper metus et neque porta, at iaculis nisi aliquam.",
      },
      {
        headline: "Second Test",
        url:
          "https://www.wired.com/story/python-language-more-popular-than-ever/",
        imageURL:
          "https://r1.ilikewallpaper.net/iphone-wallpapers/download/99644/kratos-as-cyberpunk-iphone-wallpaper-ilikewallpaper_com_200.jpg",
        description:
          "https://www.wired.com/story/python-language-more-popular-than-ever/",
      },
    ];

    res.render("index", { articles: testItem });
  });
};
