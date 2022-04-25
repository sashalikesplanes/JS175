const HTTP = require("http");
const URL = require("url").URL;
const HANDLEBARS = require("handlebars");

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
      <form action="/loan-offer" method="get">
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

const getLoanOffer = (params) => {
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

const getParams = (path) => {
  return new URL(path, `http://localhost:${PORT}`).searchParams;
};

const getPathname = (path) => {
  return new URL(path, `http://localhost:${PORT}`).pathname;
};

const SERVER = HTTP.createServer((req, res) => {
  const pathname = getPathname(req.url);
  if (pathname === "/") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.write(LOAN_FORM_TEMPLATE({ apr: APR * 100 }));
    res.end();
  } else if (pathname === "/loan-offer") {
    res.statusCode = 200;

    const data = getLoanOffer(getParams(req.url));

    res.setHeader("Content-Type", "text/html");
    res.write(LOAN_OFFER_TEMPLATE(data));

    res.end();
  } else {
    res.statusCode = 404;
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on part ${PORT}`);
});
