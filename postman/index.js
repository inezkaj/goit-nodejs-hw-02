const postmark = require("postmark");
require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
const fs = require("fs").promises;

const mail = {
  From: "piotr@kedziak.com",
  To: "inez@kedziak.com",
  Subject: "Hello from Postmark",
  HtmlBody: "<strong>Hello</strong> dear Postmark user.",
  TextBody: "Hello from Postmark!",
  MessageStream: "outbound",
};

client
  .sendEmail(mail)
  .then((info) => console.log(info))
  .catch((err) => console.log(err));
console.log(mail);
