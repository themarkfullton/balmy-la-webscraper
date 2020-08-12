let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let ArticleSchema = new Schema({
  headline: {
    type: String,
    required: true,
  },

  summary: {
    type: String,
    required: true,
  },

  url: {
    type: String,
    required: true,
  },

  imageURL: {
    type: String,
    required: true,
  },

  slug: {
    type: String,
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
