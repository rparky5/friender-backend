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

//for AWS
// router.post("/", upload.single('photo'), async function (req, res, next) {
  // Set the S3 bucket name and key (filename) under which the file will be stored
  // const bucketName = process.env.AWS_BUCKET_NAME;
  // const key = req.file.originalname;
  // console.log("bucket name>", process.env.AWS_BUCKET_NAME);

  // // Create parameters for S3 upload
  // const params = {
  //   Bucket: bucketName,
  //   Key: key,
  //   Body: req.file.buffer
  // };
  // const uploadedImg = await s3.upload(params).promise();
  // console.log("checking img upload>", uploadedImg.Location);
  // return res.json({ users });
  // return res.json({name: "rusty"})
// });

module.exports = router;
