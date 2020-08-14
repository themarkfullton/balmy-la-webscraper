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
  app.get("/", (req, res) => res.render("index"));

  app.get("/api/search", (req, res) => {
    axios.get("https://www.advocate.com/transgender").then((response) => {
      var $ = cheerio.load(response.data);

      var articlesToSend = {
        data: [],
      };

      $("article").each((i, element) => {
        var headline = $(element)
          .children(".panel-body")
          .children(".title")
          .contents();

        var summary = $(element)
          .children(".panel-body")
          .children(".teaser")
          .children("p")
          .contents();

        var url = $(element).children(".panel-image").children("a").attr("src");

        var imageURL = $(element)
          .children(".panel-image")
          .children("img")
          .attr("src");
      });
    });
  });
};
