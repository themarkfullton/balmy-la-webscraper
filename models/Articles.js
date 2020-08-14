let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let ArticleSchema = new Schema({
  headline: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  url: {
    type: String,
    required: true,
  },

  imageUrl: {
    type: String,
    required: true,
  },

  remark: [
    {
      type: Schema.Types.ObjectId,
      ref: "Remark",
    },
  ],
});

let Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
