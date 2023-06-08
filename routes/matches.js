"use strict";

/** Routes for matches. */

// const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
// const { BadRequestError } = require("../expressError");
const User = require("../models/user");
// const { createToken } = require("../helpers/tokens");
// const userNewSchema = require("../schemas/userNew.json");
// const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

router.post("/:username", ensureCorrectUser, async function (req, res, next) {
  const {viewedUser, didLike} = req.body;
  const currUser = req.params.username;
  const interaction = await User.userInteraction(currUser, viewedUser, didLike);

  return res.json({ interaction })
})

/** GET / => { matches: [ { curr_user, viewed_user }, ... ] }
 *
 * Returns list of all matches between "this" user and another user.
 **/

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  const matches = await User.userMatches(req.params.username);
  return res.json({ matches });
});


module.exports = router;