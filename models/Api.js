const { Schema, model } = require("mongoose");

const apiSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ref: {
      type: String,
      default: "",
    },
    access_key: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    json: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Owner",
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

apiSchema.index({ "$**": "text" });

module.exports = model("Api", apiSchema);
