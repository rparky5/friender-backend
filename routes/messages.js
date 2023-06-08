"use strict";

/** Routes for users. */

// const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectUser } = require("../middleware/auth");
// const { BadRequestError } = require("../expressError");
const Message = require("../models/message");
// const userNewSchema = require("../schemas/userNew.json");
// const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

/** GET / => { messages: [ { to_user, from_user, message, timestamp }, ... ] }
 * Returns list of all messages between "this" user and another user.
 **/

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  const messages = await Message.findAll(req.params.username, req.query.otherUser );
  return res.json({ messages });
});

/** POST /
 * message should be {  }
 * Returns {  }
 * ADD SCHEMA VALIDATION IF TIME
 */

router.post("/:username", ensureCorrectUser, async function (req, res, next) {
  const message = await Message.create(req.body);
  return res.status(201).json({ message });
});


module.exports = router;