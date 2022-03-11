const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

router.post("/upload-image", async (req, res) => {
  try {
    const { dataurl, filename } = req.body;

    const base64Data = dataurl.replace(/^data:image\/png;base64,/, "");
    const ext =
      filename.split(".").length == 1 ? "png" : filename.split(".").pop();
    const fname = filename.split(".")[0] + "_" + Date.now() + "." + ext;
    fs.writeFile(
      path.join(__dirname, "..", "public", fname),
      base64Data,
      "base64",
      (err) => {
        if (err) {
          res.status(500).json({
            message: err.message,
            code: 500,
          });
        } else {
          res.json({
            code: 200,
            message: "Success",
            url: "/pretty-api-server/" + fname,
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message, code: 500 });
  }
});

module.exports = router;
