const express = require("express");
const path = require("path");
const generateRouter = require("./server/api/generate");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index");
});

app.use(generateRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
