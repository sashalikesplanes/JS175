const express = require("express");
const morgan = require("morgan");
const app = express();

const COUNTRY_DATA = [
  {
    path: "/english",
    flag: "flag-of-United-States-of-America.png",
    alt: "US Flag",
    title: "Go to US English site",
  },
  {
    path: "/french",
    flag: "flag-of-France.png",
    alt: "Drapeau de la france",
    title: "Aller sur le site français",
  },
  {
    path: "/serbian",
    flag: "flag-of-Serbia.png",
    alt: "Застава Србије",
    title: "Идите на српски сајт",
  },
  {
    path: "/russian",
    flag: "flag-of-Russia.png",
    alt: "Русский флаг",
    title: "Иди на русский сайт",
  },
];
const LANGUAGE_CODES = {
  english: "en-US",
  french: "fr-FR",
  serbian: "sr-Cryl-rs",
  russian: "ru-RU",
};

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));
app.use(morgan("common"));
app.use((err, req, res, _next) => {
  console.log(err);
  res.status(404).send(err.message);
});

app.locals.currentPathClass = (path, currentPath) => {
  return path === currentPath ? "current" : "";
};

app.get("/", (req, res) => {
  res.redirect("/english");
});

app.get("/:language", (req, res, next) => {
  const language = req.params.language;
  const languageCode = LANGUAGE_CODES[language];
  if (!languageCode) {
    next(new Error(`Language not supported: ${language}`));
  } else {
    res.render(`hello-world-${language}`, {
      countries: COUNTRY_DATA,
      currentPath: req.path,
      language: languageCode,
    });
  }
});

// app.get("/english", helloWorld("hello-world-english", "en-GB"));
// app.get("/french", helloWorld("hello-world-french", "fr-FR"));
// app.get("/serbian", helloWorld("hello-world-serbian", "sr-Cyrl-rs"));
// app.get("/russian", helloWorld("hello-world-russian", "ru-RU"));

app.listen(3000, "localhost", () => {
  console.log("Listening on port 3000");
});
