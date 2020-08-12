let axios = require("axios");
let cheerio = require("cheerio");
let mongoose = require("mongoose");
let db = require("../models");

mongoose.Promise = Promise;
mongoose.connect(process.env.TWICE_REMOVED_DB, {
  useMongoClient: true,
});

let mongooseConnection = mongoose.connection;

mongooseConnection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongooseConnection.once("open", function () {
  console.log("Connected to Database");
});

module.exports = (app) => {
  app.get("/", (req, res) => res.render("index"));
};
