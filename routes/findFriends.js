"use strict";

// const AWS = require('aws-sdk');
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_CODE,
//   secretAccessKey: process.env.AWS_SECRET_CODE
// });

// const multer = require('multer');
// const upload = multer({ storage: multer.memoryStorage() });

// const s3 = new AWS.S3({ region: process.env.AWS_REGION });

/** Routes for users. */

// const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
// const { BadRequestError } = require("../expressError");
const User = require("../models/user");
// const userNewSchema = require("../schemas/userNew.json");
// const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

/** GET / => { users: [ {username, firstName, lastName, email, hobbies, zipCode, radius }, ... ] }
 * Returns list of all users who haven't previously been viewed by this user.
 **/

router.get("/:username",ensureCorrectUser, async function (req, res, next) {
  const users = await User.findAll(req.params.username);
  return res.json({ users });
});

module.exports = router;
