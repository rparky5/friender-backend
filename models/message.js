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

  //-------ABOVE FRIENDER, BELOW JOBLY----------------

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle, company }
   *   where company is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
   **/

  // static async get(id) {
  //   const jobRes = await db.query(`
  //       SELECT id,
  //              title,
  //              salary,
  //              equity,
  //              company_handle AS "companyHandle"
  //       FROM jobs
  //       WHERE id = $1`, [id]);

  //   const job = jobRes.rows[0];

  //   if (!job) throw new NotFoundError(`No job: ${id}`);

  //   const companiesRes = await db.query(`
  //       SELECT handle,
  //              name,
  //              description,
  //              num_employees AS "numEmployees",
  //              logo_url      AS "logoUrl"
  //       FROM companies
  //       WHERE handle = $1`, [job.companyHandle]);

  //   delete job.companyHandle;
  //   job.company = companiesRes.rows[0];

  //   return job;
  // }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  // static async update(id, data) {
  //   const { setCols, values } = sqlForPartialUpdate(
  //       data,
  //       {});
  //   const idVarIdx = "$" + (values.length + 1);

  //   const querySql = `
  //       UPDATE jobs
  //       SET ${setCols}
  //       WHERE id = ${idVarIdx}
  //       RETURNING id,
  //           title,
  //           salary,
  //           equity,
  //           company_handle AS "companyHandle"`;
  //   const result = await db.query(querySql, [...values, id]);
  //   const job = result.rows[0];

  //   if (!job) throw new NotFoundError(`No job: ${id}`);

  //   return job;
  // }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  // static async remove(id) {
  //   const result = await db.query(
  //       `DELETE
  //        FROM jobs
  //        WHERE id = $1
  //        RETURNING id`, [id]);
  //   const job = result.rows[0];

  //   if (!job) throw new NotFoundError(`No job: ${id}`);
  // }
}

module.exports = Message;