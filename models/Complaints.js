let mongoose = require("mongoose");

let Schema = mongoose.Schema;

var complaintSchema = new Schema({
  author: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numRating: {
    type: Number,
    default: 0,
  },
  body: {
    type: String,
    required: true,
  },
});

var Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
