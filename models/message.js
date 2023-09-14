"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
// const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for messages. */

class Message {
  /** Create a message (from data), update db, .
   *
   * data should be { to_user │ from_user │ message } //add timestamp
   **/

  static async create(data) {
    const result = await db.query(`
        INSERT INTO messages (to_user,
                          from_user,
                          message,
                          timestamp)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING
          to_user AS toUser,
          from_user AS fromUser,
          message,
          timestamp`, [
      data.toUser,
      data.fromUser,
      data.message
    ]);
    const message = result.rows[0];
    // const message = {"testing": "confirmed message"}


    return message;
  }



  /** Find all messages associated with a username.
   *
   * Returns [{ to_user, from_user, message, timestamp  }, ...]
   * return with time stamp ascending?
   * */

  static async findAll(username, otherUser ) {

    const messageRes = await db.query(`
        SELECT to_user AS "toUser",
               from_user AS "fromUser",
               message,
               timestamp
        FROM messages
        WHERE from_user = $1 AND to_user = $2 OR from_user = $2 AND to_user = $1
        ORDER BY timestamp DESC`,
        [username, otherUser]);

    return messageRes.rows;
  }
}

module.exports = Message;