const express = require("express");
const exphbs = require("express-handlebars");
var db = require("./models");

const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.static("/public/"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
  })
);

app.set("view engine", "handlebars");

require("./routes/balmyLAController")(app);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
