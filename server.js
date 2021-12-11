const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const errorhandler = require("errorhandler");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

const apiRouter = require("./api/api");
app.use("/api", apiRouter);

app.use(errorhandler());

app.listen(PORT, () => {
  console.log("Server currently listening on port: " + PORT);
});

module.exports = app;
