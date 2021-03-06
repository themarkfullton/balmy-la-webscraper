const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const db = require("../models");
const argon2 = require("argon2");
const session = require("express-session");

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

module.exports = (app) => {
  // ==============================================
  // Routes
  // ==============================================

  const redirectLogin = (req, res, next) => {
    if (!req.session.user) {
      res.redirect("/login");
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

  app.get("/", (req, res) => res.render("intro"));

  app.get("/weather", async (req, res) => {
    axios
      .get(
        "https://weather-and-climate.com/10-ten-day-forecast-fahrenheit,Los-Angeles,United-States-of-America"
      )
      .then((resp) => {
        let $ = cheerio.load(resp.data);

        console.log(req.session);

        var weatherToSend = {
          data: [],
        };

        $(".forecast").each((i, element) => {
          weatherToSend.data.push({
            day: $(element).find(".date").text(),
            temp: $(element).find(".temperature").text(),
            weather: $(element).find("img").attr("src"),
            weatherDesc: $(element).find(".text").find("p").text(),
          });
        });
        var cookieUser = req.session.user ? true : false;

        res.render("index", {
          weather: weatherToSend.data,
          user: cookieUser,
        });
      })
      .catch((err) => res.send(`Axios failed: ${err}`));
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
            res.redirect("/weather");
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
          res.redirect("/weather");
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
        day: req.body.day,
        temp: req.body.temp,
        weather: req.body.weather,
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
    await db.Weather.findOne({ day: req.body.day }, "day", (err, resp) => {
      if (err) return handleError(err);
    }).then(async (resp) => {
      if (resp === null) {
        await db.Weather.create({
          day: req.body.day,

          temp: req.body.temp,

          weather: req.body.weather,

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
              res.redirect("/weather");
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
            res.redirect("/weather");
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
