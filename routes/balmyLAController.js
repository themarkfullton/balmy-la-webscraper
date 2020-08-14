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
    axios
      .get(
        "https://www.accuweather.com/en/us/los-angeles/90012/daily-weather-forecast/347625"
      )
      .then((response) => {
        let $ = cheerio.load(response.data);

        var weatherToSend = {
          data: [],
        };

        $(".daily-wrapper").each((i, element) => {
          weatherToSend.data.push({
            dayName: $(element).find(".dow").text(),
            dayNumber: $(element).find(".sub").text(),
            temp: $(element).find(".high").text(),
            weather:
              "https://www.accuweather.com/" +
              $(element).find("img.weather-icon").attr("data-src"),
            weatherDesc: $(element).find("div.phrase").text(),
          });
        });

        res.render("index", { weather: weatherToSend.data });
      });
  });
};
