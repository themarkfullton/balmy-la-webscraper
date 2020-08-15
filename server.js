const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
var db = require("./models");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static(__dirname + "/public/"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
  })
);
app.set("view engine", "handlebars");

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

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

var routes = require("./routes/balmyLAController")(app);
