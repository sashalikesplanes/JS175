const HTTP = require("http");
const URL = require("url").URL;
const HANDLEBARS = require("handlebars");

const PORT = 3000;

const SOURCE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <style type="text/css">
      body {
        background: rgba(250, 250, 250);
        font-family: sans-serif;
        color: rgb(50, 50, 50);
      }

      article {
        width: 100%;
        max-width: 40rem;
        margin: 0 auto;
        padding: 1rem 2rem;
      }

      h1 {
        font-size: 2.5rem;
        text-align: center;
      }

      table {
        font-size: 1.5rem;
      }
      th {
        text-align: right;
      }
      td {
        text-align: center;
      }
      th,
      td {
        padding: 0.5rem;
      }
    </style>
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>
          <tr>
            <th>Amount:</th>
            <td>
              <a href='/?amount={{amountDecrement}}&duration={{duration}}'>- $100</a>
            </td>
            <td>$ {{amount}}</td>
            <td>
              <a href='/?amount={{amountIncrement}}&duration={{duration}}'>+ $100</a>
            </td>
          </tr>
          <tr>
            <th>Duration:</th>
            <td>
              <a href='/?amount={{amount}}&duration={{durationDecrement}}'>- 1 year</a>
            </td>
            <td>{{duration}} years</td>
            <td>
              <a href='/?amount={{amount}}&duration={{durationIncrement}}'>+ 1 year</a>
            </td>
          </tr>
          <tr>
            <th>APR:</th>
            <td colspan='3'>{{aprPercent}}%</td>
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

const LOAN_OFFER_TEMPLATE = HANDLEBARS.compile(SOURCE);

const render = (template, data) => {
  let html = template(data);
  return html;
};

const getMonthlyLoan = (amount, durationYears, APR) => {
  // Perform calculations
  const MPR = APR / 12;
  const durationMonths = durationYears * 12;
  return amount * (MPR / (1 - Math.pow(1 + MPR, -durationMonths)));
};

const getLoanOffer = (params) => {
  const APR = 0.05;
  const data = {};

  data.amount = Number(params.get("amount"));
  data.amountIncrement = data.amount + 100;
  data.amountDecrement = data.amount - 100;
  data.duration = Number(params.get("duration"));
  data.durationIncrement = data.duration + 1;
  data.durationDecrement = data.duration - 1;
  data.aprPercent = APR * 100;

  data.payment = getMonthlyLoan(data.amount, data.duration, APR).toFixed(2);

  return data;
};

const SERVER = HTTP.createServer((req, res) => {
  // Read URL params
  const reqURL = new URL(req.url, `http://${req.headers.host}`);

  // Write response
  if (req.url === "/favicon.ico") {
    res.statusCode = 404;
    res.end();
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    const data = getLoanOffer(reqURL.searchParams);
    res.write(LOAN_OFFER_TEMPLATE(data));
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on part ${PORT}`);
});
