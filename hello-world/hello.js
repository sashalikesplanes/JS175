const express = require("express");
const app = express();

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));

const writeLog = (req, res) => {
  let timeStamp = String(new Date()).substring(4, 24);
  console.log(
    `${timeStamp} ${req.method} ${req.originalUrl} ${res.statusCode}`
  );
};

app.get("/", (req, res) => {
  res.redirect("/english");
  writeLog(req, res);
});

app.get("/english", (req, res) => {
  res.render("hello-world-english");
  writeLog(req, res);
});

app.get("/french", (req, res) => {
  res.render("hello-world-french");
  writeLog(req, res);
});

app.get("/serbian", (req, res) => {
  res.render("hello-world-serbian");
  writeLog(req, res);
});

app.get("/russian", (req, res) => {
  res.render("hello-world-russian");
  writeLog(req, res);
});

app.listen(3000, "localhost", () => {
  console.log("Listening on port 3000");
});
