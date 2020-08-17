const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const db = require("../models");
const argon2 = require("argon2");
const session = require("express-session");
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
  app.use(
    session({
      name: "sid",
      saveUninitialized: false,
      resave: false,
      secret: process.env.SECRET_KEY,
      cookie: {
        maxAge: 28800000,
        sameSite: true,
      },
    })
  );

  app.get("/", (req, res) => {
    axios
      .get(
        "https://www.accuweather.com/en/us/los-angeles/90012/daily-weather-forecast/347625"
      )
      .then((response) => {
        let $ = cheerio.load(response.data);

        console.log(req.session);

        var weatherToSend = {
          data: [],
        };

        $(".daily-wrapper").each((i, element) => {
          weatherToSend.data.push({
            dayName: $(element).find(".dow").text(),
            dayNumber: $(element).find(".sub").text(),
            temp: $(element).find(".high").text(),
            weather:
              "https://www.accuweather.com" +
              $(element).find("img.weather-icon").attr("data-src"),
            weatherDesc: $(element).find("div.phrase").text(),
          });
        });

        var cookieUser = req.session.user ? true : false;

        console.log(cookieUser);

        res.render("index", {
          weather: weatherToSend.data,
          user: cookieUser,
        });
      });
  });

  app.get("/login", (req, res) => {
    res.render("login");
  });

  app.get("/register", (req, res) => {
    res.render("register");
  });

  app.get("/show-complaints", async (req, res) => {
    await db.Weather.find({}).then(async (resp) => {
      console.log(resp);
      res.render("showComplaints", resp);
    });
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
          .then((resp) => {
            req.session.user = username;
            res.redirect("/");
          })
          .catch((err) => res.json(err));
      }
    });
  });

  app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    await db.User.findOne(
      { username: username },
      "username password",
      (err, resp) => {
        if (err) return handleError(err);
      }
    ).then(async (resp) => {
      var searchSet = resp.password;

      const valid = await argon2.verify(searchSet, password);

      if (valid) {
        req.session.user = resp.username;
        res.redirect("/");
      } else {
        res.redirect("/register");
      }
    });
  });

  app.post("/complain", (req, res) => {
    var complaintToExplain = [
      {
        dayName: req.body.dayName,
        dayNumber: req.body.dayNumber,
        temp: req.body.temp,
        weatherImg: req.body.weather,
        weatherDesc: req.body.weatherDesc,
      },
    ];

    var cookieUser = req.session.user ? true : false;

    res.render("complaint", {
      weather: complaintToExplain,
      user: cookieUser,
    });
  });

  app.post("/add-complaint", async (req, res) => {
    await db.Weather.findOne(
      { dayNumber: req.body.dayNumber },
      "dayNumber",
      (err, resp) => {
        if (err) return handleError(err);
      }
    ).then(async (resp) => {
      if (resp === null) {
        await db.Weather.create({
          dayName: req.body.dayName,

          dayNumber: req.body.dayNumber,

          temp: req.body.temp,

          weather: req.body.weatherImg,

          weatherDesc: req.body.weatherDesc,
        }).then(async (resp) => {
          console.log(resp);
          var addedWeather = resp._id;

          await db.Complaint.create({
            author: req.session.user,
            weather: addedWeather,
            body: req.body.complaint,
          })
            .then((resp) => {
              res.redirect("/");
            })
            .catch((err) => res.json(err));
        });
      } else {
        var addedWeather = resp._id;

        await db.Complaint.create({
          author: req.session.user,
          weather: addedWeather,
          body: req.body.complaint,
        })
          .then(async (err, resp) => {
            res.redirect("/");
          })
          .catch((err) => res.json(err));
      }
    });
  });

  app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect("/");
      }
      res.clearCookie("sid");
      res.redirect("/");
    });
  });
};
