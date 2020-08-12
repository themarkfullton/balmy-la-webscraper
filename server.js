const express = require("express");
const exphbs = require("express-handlebars");
var db = require("./models");

const port = process.env.PORT || 3000;

const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main",
    });
);
app.set("view engine", "handlebars");

var routes = require("./routes/twiceRemovedController")(app);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
