const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello Bitch\n");
});

app.listen(3000, "localhost", () => {
  console.log("Listening on port 3000");
});
