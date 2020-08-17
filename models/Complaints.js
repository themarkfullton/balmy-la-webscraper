let mongoose = require("mongoose");

let Schema = mongoose.Schema;

var complaintSchema = new Schema({
  author: {
    type: String,
    required: true,
  },
  weather: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
});

var Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
