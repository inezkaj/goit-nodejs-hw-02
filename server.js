const app = require("./app");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

app.use(express.json());
app.use(cors());
require("dotenv").config();

const { DB_HOST: uriDb } = process.env;

const connection = mongoose.connect(uriDb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
connection
  .then(() => {
    app.listen(3000, function () {
      console.log(`Database connection successful`);
    });
  })
  .catch((err) => {
    console.log(`Server not running. Error message: ${err.message}`);
    process.exit(1);
  });
