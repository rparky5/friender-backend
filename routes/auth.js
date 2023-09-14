"use strict";

/** Routes for authentication. */

// const jsonschema = require("jsonschema");

const express = require("express");
const {ensureCorrectUser} = require("../middleware/auth")
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const User = require("../models/user");
//HAVENT MADE SCHEMA YET
// const userAuthSchema = require("../schemas/userAuth.json");
// const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");

const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_CODE,
  secretAccessKey: process.env.AWS_SECRET_CODE
});

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const s3 = new AWS.S3({ region: process.env.AWS_REGION });

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  // const validator = jsonschema.validate(
  //   req.body,
  //   userAuthSchema,
  //   {required: true}
  // );
  // if (!validator.valid) {
  //   const errs = validator.errors.map(e => e.stack);
  //   throw new BadRequestError(errs);
  // }

  const { username, password } = req.body;
  const user = await User.authenticate(username, password);
  const token = createToken(user);
  return res.json({ token, user });
});

/** POST /auth/register:   { user } => { token }
 * user must include { username, password, firstName, lastName, email }
 * Returns JWT token which can be used to authenticate further requests.
 * Authorization required: none
 */

router.post("/register", upload.single('photoUrl'), async function (req, res, next) {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const key = req.file.originalname;

  // Create parameters for S3 upload
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: req.file.buffer
  };
  const uploadedImg = await s3.upload(params).promise();
  //add variable to hold photo url and props from req.body, pass that into
  // User.register instead of re.body
  const propsWithPhotoUrl = {...req.body, photoUrl: uploadedImg.Location};

  const user = await User.register({ ...propsWithPhotoUrl });
  const token = createToken(user);
  return res.status(201).json({ token, user });
});

/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin, jobs }
 *   where jobs is { id, title, companyHandle, companyName, state }
 *
 * Authorization required: admin or same user-as-:username
 **/

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  const user = await User.get(req.params.username);
  return res.json({ user });
});


module.exports = router;
