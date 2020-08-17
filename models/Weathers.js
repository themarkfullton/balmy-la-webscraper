let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let weatherSchema = new Schema(
  {
    dayName: {
      type: String,
      required: true,
    },

    dayNumber: {
      type: String,
      required: true,
    },

    temp: {
      type: String,
      required: true,
    },

    weather: {
      type: String,
      required: true,
    },

    weatherDesc: {
      type: String,
      required: true,
    },

    complaints: [],
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

let Weather = mongoose.model("Weather", weatherSchema);

module.exports = Weather;
