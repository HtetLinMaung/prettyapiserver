const { Schema, model } = require("mongoose");

const ownerSchema = new Schema(
  {
    ownerid: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      type: String,
      default: "",
    },
    apis: [
      {
        type: Schema.Types.ObjectId,
        ref: "Api",
      },
    ],
  },
  {
    timestamps: true,
  }
);

ownerSchema.index({ "$**": "text" });

module.exports = model("Owner", ownerSchema);
