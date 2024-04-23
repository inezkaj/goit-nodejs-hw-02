const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const routerAuth = require("./routes/api/auth");
const app = express();

app.use(express.json());
app.use(cors());

const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(logger(formatsLogger));

app.use("/users", routerAuth);

app.use((_, res, __) => {
  res.status(404).json({
    status: "error",
    code: 404,
    message: `Use api on routes: 
    /users/signup - registration user {email, password}
    /users/login - login {email, password}
    /users/current - get message if user is authenticated`,
    data: "Not found",
  });
});

app.use((err, _, res, __) => {
  console.log(err.stack);
  res.status(500).json({
    status: "fail",
    code: 500,
    message: err.message,
    data: "Internal Server Error",
  });
});

module.exports = app;
