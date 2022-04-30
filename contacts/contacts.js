const express = require("express");
const morgan = require("morgan");
const { body, validationResult } = require("express-validator");
const session = require("express-session");
const store = require("connect-loki");

const app = express();
const LokiStore = store(session);

const contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

const sortContacts = (contacts) => {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
};

const clone = (object) => JSON.parse(JSON.stringify(object));

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));
app.use(morgan("common"));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    cookie: {
      httpOnly: true,
      maxAge: 31 * 24 * 60 * 60 * 1000,
      path: "/",
      secure: false,
    },
    name: "launch-school-contact-manager-session-id",
    resave: false,
    saveUninitialized: true,
    secret: "this is not very secure",
    store: new LokiStore({}),
  })
);
app.use((req, res, next) => {
  if (!("contactData" in req.session)) {
    req.session.contactData = clone(contactData);
  }
  next();
});

app.get("/", (req, res) => res.redirect("/contacts"));

app.get("/contacts", (req, res) => {
  res.render("contacts", {
    contacts: sortContacts(req.session.contactData),
  });
});

app.get("/contacts/new", (req, res) => {
  res.render("new-contact");
});

const validateName = (name, whichName) => {
  return body(name)
    .trim()
    .isLength({ min: 1 })
    .withMessage(`${whichName} is required`)
    .bail()
    .isLength({ max: 25 })
    .withMessage(`${whichName} too long`)
    .isAlpha()
    .withMessage(`${whichName} must be alphabetic`);
};

app.post(
  "/contacts/new",
  [
    validateName("firstName", "First Name"),
    validateName("lastName", "Last Name"),

    body("lastName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name is required")
      .bail()
      .isLength({ max: 25 })
      .withMessage("Last name too long")
      .isAlpha()
      .withMessage("Last name must be alphabetic"),

    body("phoneNumber")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Phone number is required")
      .bail()
      .matches(/^\d{3}-\d{3}-\d{4}$/)
      .withMessage("Invalid phone number"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("new-contact", {
        errorMessages: errors.array().map((error) => error.msg),
        ...req.body,
      });
    } else {
      next();
    }
  },
  (req, res) => {
    req.session.contactData.push({ ...req.body });

    res.redirect("/contacts");
  }
);

app.listen(3000, "localhost", () => console.log("Listening to port 3000"));
