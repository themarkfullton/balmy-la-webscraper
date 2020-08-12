let mongoose = require("mongoose");

let Schema = mongoose.Schema;

var remarkSchema = new Schema({
  body: String,
});

var Remark = mongoose.model("Remark", remarkSchema);

module.exports = Remark;
