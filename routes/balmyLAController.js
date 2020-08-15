const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const db = require("../models");
const argon2 = require("argon2");
require("dotenv").config();

mongoose.Promise = Promise;

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const mongooseConnection = mongoose.connection;

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

  app.get("/login", (req, res) => {
    res.render("login");
  });

  app.get("/register", (req, res) => {
    res.render("register");
  });

  //==============================================
  // Post Routes
  //==============================================

  app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const hashword = await argon2.hash(password);

    await db.User.findOne({ username: username }, "username", (err, resp) => {
      if (err) return handleError(err);
    }).then((resp) => {
      if (resp === null) {
        db.User.create({
          username: username,
          password: hashword,
        })
          .then((resp) => res.redirect("/"))
          .catch((err) => res.json(err));
      }
    });
  });
};
