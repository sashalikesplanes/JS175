const HTTP = require("http");
const URL = require("url").URL;
const HANDLEBARS = require("handlebars");
const FS = require("fs");
const PATH = require("path");
const QUERYSTRING = require("querystring");

const MIME_TYPES = {
  ".css": "text/css",
  ".js": "application/javascript",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const PORT = 3000;
const APR = 0.05;

const LOAN_OFFER_SOURCE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>
          <tr>
            <th>Amount:</th>
            <td>
              <a href='/loan-offer?amount={{amountDecrement}}&duration={{duration}}'>- $100</a>
            </td>
            <td>$ {{amount}}</td>
            <td>
              <a href='/loan-offer?amount={{amountIncrement}}&duration={{duration}}'>+ $100</a>
            </td>
          </tr>
          <tr>
            <th>Duration:</th>
            <td>
              <a href='/loan-offer?amount={{amount}}&duration={{durationDecrement}}'>- 1 year</a>
            </td>
            <td>{{duration}} years</td>
            <td>
              <a href='/loan-offer?amount={{amount}}&duration={{durationIncrement}}'>+ 1 year</a>
            </td>
          </tr>
          <tr>
            <th>APR:</th>
            <td colspan='3'>{{apr}}%</td>
          </tr>
          <tr>
            <th>Monthly payment:</th>
            <td colspan='3'>$ {{payment}}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </body>
</html>
`;

const LOAN_FORM_SOURCE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
  </head>

  <body>
    <article>
      <h1>Loan Calculator</h1>
      <form action="/loan-offer" method="post">
        <p>All loans are offered at an APR of {{apr}}%.</p>
        <label for="amount">How much do you want to borrow (in dollars)?</label>
        <input type="number" name="amount" value="">
        <label for="amount">How much time do you want to pay back your loan?</label>
        <input type="number" name="duration" value="">
        <input type="submit" name="" value="Get loan offer!">
      </form>
    </article>
  </body>
</html>
`;

const LOAN_OFFER_TEMPLATE = HANDLEBARS.compile(LOAN_OFFER_SOURCE);
const LOAN_FORM_TEMPLATE = HANDLEBARS.compile(LOAN_FORM_SOURCE);

const getMonthlyLoan = (amount, durationYears, APR) => {
  // Perform calculations
  const MPR = APR / 12;
  const durationMonths = durationYears * 12;
  return amount * (MPR / (1 - Math.pow(1 + MPR, -durationMonths)));
};

const createLoanOffer = (data) => {
  data.amountIncrement = data.amount + 100;
  data.amountDecrement = data.amount - 100;
  data.durationIncrement = data.duration + 1;
  data.durationDecrement = data.duration - 1;
  data.aprPercent = APR * 100;

  data.payment = getMonthlyLoan(data.amount, data.duration, APR).toFixed(2);

  return data;
};

const getParams = (path) => {
  const params = new URL(path, `http://localhost:${PORT}`).searchParams;
  const data = {};
  data.amount = Number(params.get("amount"));
  data.duration = Number(params.get("duration"));

  return data;
};

const getPathname = (path) => {
  return new URL(path, `http://localhost:${PORT}`).pathname;
};

const parseFormData = (request, callback) => {
  let body = "";
  request.on("data", (chunk) => {
    body += chunk.toString();
  });
  request.on("end", () => {
    let data = QUERYSTRING.parse(body);
    data.amount = Number(data.amount);
    data.duration = Number(data.duration);
    callback(data);
  });
};

const getIndex = (res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");

  const content = LOAN_FORM_TEMPLATE({ apr: APR * 100 });
  res.write(`${content}\n`);
  res.end();
};

const getLoanOffer = (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");

  const data = createLoanOffer(getParams(req.url));
  const content = LOAN_OFFER_TEMPLATE(data);
  res.write(`${content}\n`);
  res.end();
};

const postLoanOffer = (req, res) => {
  parseFormData(req, (parsedData) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");

    const data = createLoanOffer(parsedData);
    const content = LOAN_OFFER_TEMPLATE(data);
    res.write(`${content}\n`);
    res.end();
  });
};
const SERVER = HTTP.createServer((req, res) => {
  const pathname = getPathname(req.url);
  let fileExtension = PATH.extname(pathname);

  FS.readFile(`./public/${pathname}`, (err, data) => {
    if (data) {
      res.statusCode = 200;
      res.setHeader("Content-Type", `${MIME_TYPES[fileExtension]}`);
      res.write(`${data}\n`);
      res.end();
    } else {
      const method = req.method;
      if (pathname === "/" && method === "GET") {
        getIndex(res);
      } else if (pathname === "/loan-offer" && method === "GET") {
        getLoanOffer(req, res);
      } else if (pathname === "/loan-offer" && method === "POST") {
        postLoanOffer(req, res);
      } else {
        res.statusCode = 404;
        res.end();
      }
    }
  });
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on part ${PORT}`);
});
