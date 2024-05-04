const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const path = require("path");
const bCrypt = require("bcryptjs");
const gravatar = require("gravatar");
const { v4: uuidV4 } = require("uuid");
const fs = require("fs").promises;
const ejs = require("ejs");

const nodemailer = require("nodemailer");
const postmarkTransport = require("nodemailer-postmark-transport");

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: {
    type: String,
    default: null,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  avatarURL: {
    type: String,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, "Verify token is required"],
  },
});

userSchema.methods.setPassword = function (password) {
  this.password = bCrypt.hashSync(password, bCrypt.genSaltSync(6));
};

userSchema.methods.setAvatarByEmail = function () {
  this.avatarURL = gravatar.url(this.email);
};

userSchema.methods.updateAvatar = function () {
  return (this.avatarURL = gravatar.url(this.email));
};

userSchema.methods.updateAvatarFromFile = function (fileName) {
  return (this.avatarURL = `/avatars/${fileName}`);
};

userSchema.methods.setVerificationToken = function (verificationToken) {
  return (this.verificationToken = uuidV4());
};

userSchema.methods.sendVerificationEmail = async function () {
  const htmlTemplatePath = path.join(
    process.cwd(),
    "views",
    "emailTemplate.ejs"
  );
  const template = await fs.readFile(htmlTemplatePath, "utf-8");
  const html = await ejs.render(template, {
    verificationToken: this.verificationToken,
  });

  const transport = nodemailer.createTransport(
    postmarkTransport({
      auth: {
        apiKey: process.env.POSTMARK_SERVER_TOKEN,
      },
    })
  );

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: this.email,
    subject: "Welcome to MyApp",
    html,
  };

  return new Promise((resolve, reject) => {
    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(info);
    });
  });
};

userSchema.methods.validPassword = function (password) {
  return bCrypt.compareSync(password, this.password);
};

const User = mongoose.model("user", userSchema);
module.exports = User;
