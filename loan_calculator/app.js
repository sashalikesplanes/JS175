const HTTP = require("http");
const PORT = 3000;
const URL = require("url").URL;
const APR = 0.05;

const HTML_START = `
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
        font-size: 2rem;
      }

      th {
        text-align: right;
      }
    </style>
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>`;

const HTML_END = `
        </tbody>
      </table>
    </article>
  </body>
</html>`;

const getMonthlyLoan = (params) => {
  const amount = params.get("amount");
  const durationYears = params.get("duration");
  // Perform calculations
  const MPR = APR / 12;
  const durationMonths = durationYears * 12;
  return amount * (MPR / (1 - Math.pow(1 + MPR, -durationMonths)));
};

const getLoanOffer = (params) => {
  const monthly = getMonthlyLoan(params);
  const content = `
    <tr>
      <th>Amount:</th>
      <td>$${params.get("amount")}</td>
    </tr>
    <tr>
      <th>Duration:</th>
      <td>${params.get("duration")} years</td>
    </tr>
    <tr>
      <th>APR:</th>
      <td>${APR * 100}%</td>
    </tr>
    <tr>
      <th>Monthly payment:</th>
      <td>$${monthly.toFixed(2)}</td>
    </tr>`;
  return HTML_START + content + HTML_END;
};

const SERVER = HTTP.createServer((req, res) => {
  // Read URL params
  const reqURL = new URL(req.url, `http://${req.headers.host}`);

  // Write response
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.write(getLoanOffer(reqURL.searchParams));
  res.end();
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on part ${PORT}`);
});
