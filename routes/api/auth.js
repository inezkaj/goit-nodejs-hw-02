const fs = require("fs").promises;
const express = require("express");
const User = require("../../models/user.js");
const router = express.Router();
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const passport = require("passport");
const ejs = require("ejs");

const path = require("path");
const multer = require("multer");
const { v4: uuidV4 } = require("uuid");
const Jimp = require("jimp");

require("dotenv").config();
const secret = process.env.SECRET;

const jwtOptions = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

// JWT Strategy
passport.use(
  new JwtStrategy(jwtOptions, function (payload, done) {
    User.find({ _id: payload.id })
      .then(([user]) => {
        if (!user) {
          return done(new Error("User not found"));
        }
        return done(null, user);
      })
      .catch((err) => done(err));
  })
);

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Unauthorized",
        data: "Unauthorized",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

router.post("/signup", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email in use",
      data: "Conflict",
    });
  }
  try {
    const newUser = new User({ email });
    newUser.setPassword(password);
    newUser.setAvatarByEmail();
    newUser.setVerificationToken();
    await newUser.save();

    newUser.sendVerificationEmail().then(() => {
      res.status(201).json({
        status: "success",
        code: 201,
        data: {
          message: "Registration successful",
        },
      });
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "missing required field email",
    });
  }

  console.log(email);

  const user = await User.findOne({ email: email });
  if (user.verify === true) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Verification has already been passed",
    });
  }

  try {
    user.setVerificationToken();
    await user.save();

    user.sendVerificationEmail().then(() => {
      res.status(200).json({
        status: "success",
        code: 200,
        data: {
          message: "Verification email sent",
        },
      });
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: error,
    });
  }
});

router.get("/verify/:verificationToken", async (req, res, next) => {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOneAndUpdate(
      { verificationToken: verificationToken },
      { verificationToken: null, verify: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: "Not found",
        code: 404,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Verification successful",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email, verify: true });

  if (!user || !user.validPassword(password)) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Incorrect email or password",
      data: "Bad request",
    });
  }

  const payload = {
    id: user.id,
    em: user.username,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "12h" });
  res.json({
    status: "success",
    code: 200,
    data: {
      token,
    },
  });
});

router.get("/logout", auth, async (req, res, next) => {
  try {
    req.user.token = null;
    await req.user.save();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/current", auth, (req, res, next) => {
  const { email } = req.user;
  res.json({
    status: "success",
    code: 200,
    data: {
      message: `Authorization was successful: ${email}`,
    },
  });
});

const tempDir = path.join(process.cwd(), "tmp");
const storeImageDir = path.join(process.cwd(), "public/avatars");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidV4()}${file.originalname}`);
  },
});

const extensionWhiteList = [".jpg", ".jpeg", ".png", ".gif"];
const mimetypeWhiteList = ["image/png", "image/jpg", "image/jpeg", "image/gif"];

const uploadMiddleware = multer({
  storage,
  fileFilter: async (req, file, cb) => {
    console.log(file);
    const extension = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;
    if (
      !extensionWhiteList.includes(extension) ||
      !mimetypeWhiteList.includes(mimetype)
    ) {
      return cb(null, false);
    }
    return cb(null, true);
  },
});

router.patch(
  "/avatars",
  auth,
  uploadMiddleware.single("avatar"),
  async (req, res, next) => {
    try {
      if (req.file) {
        console.log(req.file);

        Jimp.read(req.file.path).then((avatar) => {
          avatar.resize(250, 250);

          const extension = path.extname(req.file.path);
          const fileName = `${uuidV4()}${extension}`;
          const imagePath = path.join(storeImageDir, fileName);

          avatar.writeAsync(imagePath).then(async () => {
            const avatarURL = req.user.updateAvatarFromFile(fileName);
            await req.user.save();

            if (avatarURL) {
              await fs.unlink(req.file.path);
              res.json({ avatarURL: avatarURL });
            }
          });
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
