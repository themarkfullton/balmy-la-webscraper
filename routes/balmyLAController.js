const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const db = require("../models");
const argon2 = require("argon2");
const session = require("express-session");
const path = require("path");

module.exports = (app) => {
  mongoose.Promise = Promise;

  mongoose.connect(process.env.MONGODB_URI, {
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

  const redirectLogin = (req, res, next) => {
    if (!req.session.user) {
      res.redirect("/");
    } else {
      next();
    }
  };

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

  app.get("/", async (req, res) => {
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

  app.get("/show-complaints", redirectLogin, async (req, res) => {
    await db.Weather.find({})
      .lean()
      .then(async (resp) => {
        let objectToSend = {
          data: [],
        };

        for (var i = 0; i < resp.length; i++) {
          await db.Complaint.find({
            weather: resp[i]._id,
          })
            .lean()
            .then(async (rComp) => {
              let complaintsToAdd = [];
              for (var j = 0; j < rComp.length; j++) {
                complaintsToAdd.push(rComp[j]);
              }

              resp[i].complaints = complaintsToAdd;
            });
          objectToSend.data.push(resp[i]);
        }
        console.log(`SENDING: ${JSON.stringify(objectToSend.data)}`);
        res.render("showComplaints", {
          weathers: objectToSend.data,
        });
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
    )
      .then(async (resp) => {
        var searchSet = resp.password;

        const valid = await argon2.verify(searchSet, password);

        if (valid) {
          req.session.user = resp.username;
          res.redirect("/");
        } else {
          res.redirect("/register");
        }
      })
      .catch((err) => {
        res.redirect("/register");
      });
  });

  app.post("/complain", redirectLogin, (req, res) => {
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

  app.post("/add-complaint", redirectLogin, async (req, res) => {
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
