const { Schema, model } = require("mongoose");

const tagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

apiSchema.index({ "$**": "text" });

module.exports = model("Tag", tagSchema);
