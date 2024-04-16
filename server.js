const app = require("./app");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();
app.use(express.json());
app.use(cors());

const uriDb =
  "mongodb+srv://inezkajed:Piotrek84@cluster0.rosy69j.mongodb.net/db-contacts?retryWrites=true&w=majority&appName=Cluster0";

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
