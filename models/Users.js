let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  numRating: {
    type: Number,
    default: 0,
  },

  complaint: [
    {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
    },
  ],
});

let User = mongoose.model("User", userSchema);

module.exports = User;
