const HTTP = require("http");
const PORT = 3000;
const URL = require("url").URL;

function diceRoll(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const SERVER = HTTP.createServer((req, res) => {
  let method = req.method;
  let path = req.url;
  let host = req.headers.host;

  if (path === "/favicon.ico") {
    res.statusCode = 404;
    res.end();
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");

    const reqURL = new URL(path, `http://${host}`);
    let sides = reqURL.searchParams.get("sides");
    let rolls = reqURL.searchParams.get("rolls");

    for (let i = 0; i < rolls; i++) {
      let content = diceRoll(1, sides);
      res.write(`${content}\n`);
    }
    res.write(`${method} ${path}\n`);
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
