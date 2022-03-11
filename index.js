require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const PORT = process.env.PORT || 4020;

const app = express();

app.use(cors());
app.use("/pretty-api-server", express.static("public"));
app.use(express.json({ limit: "200mb" }));

app.use("/pretty-api-server/auth", require("./routes/auth-route"));
app.use("/pretty-api-server/api", require("./routes/api-route"));
app.use("/pretty-api-server/file", require("./routes/file-route"));

mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch(console.log);
