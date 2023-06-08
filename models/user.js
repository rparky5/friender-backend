"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const zipcodes = require('zipcodes');
// const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, hobbies, zipCode, radius }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(`
        SELECT username,
               password,
               first_name AS "firstName",
               last_name  AS "lastName",
               email,
               hobbies,
               zip_code AS "zipCode",
               radius
        FROM users
        WHERE username = $1`, [username],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, hobbies, zipCode, radius }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      { username, password, firstName, lastName, email, hobbies, zipCode, radius, photoUrl }) {
    const duplicateCheck = await db.query(`
        SELECT username
        FROM users
        WHERE username = $1`, [username],
    );

    if (duplicateCheck.rows.length > 0) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(`
                INSERT INTO users
                (username,
                 password,
                 first_name,
                 last_name,
                 email,
                 hobbies,
                 zip_code,
                 radius,
                 photo_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING
                    username,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    email,
                    hobbies,
                    zip_code AS "zipCode",
                    radius,
                    photo_url AS "photoUrl"`, [
          username,
          hashedPassword,
          firstName,
          lastName,
          email,
          hobbies,
          zipCode,
          radius,
          photoUrl
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users that haven't been viewed already.
   *
   * Returns [{ username, first_name, last_name, email, hobbies, zipCode, radius}, ...]
   **/

          //pass in username!!
  static async findAll(username) {
    const result = await db.query(`
        SELECT username,
               first_name AS "firstName",
               last_name  AS "lastName",
               email,
               hobbies,
               zip_code AS "zipCode",
               radius
        FROM users
        WHERE username NOT IN (
          SELECT viewed_user
          FROM interactions
          WHERE curr_user = $1
        )
        AND username != $1
        ORDER BY username`,[username]
    );
    //make a query for current users zipcode and radious
    const userZipAndRadius = await db.query(`
      SELECT zip_code AS "zipCode", radius
      FROM users
      WHERE username = $1
      `,[username]);

    const radius = userZipAndRadius.rows[0].radius;

    console.log("radius,", radius)
    const zipCode = userZipAndRadius.rows[0].zipCode;
    console.log("zipCode,", zipCode);

    const zipsInRange = zipcodes.radius(zipCode, radius);

    console.log("user zipsInRange", zipsInRange)

    const usersInRadius = result.rows.filter(user => zipsInRange.includes(user.zipCode.toString()));
    console.log("type zip code=", typeof result.rows[0].zipCode);

    // create an array of zipcodes that are within distance of curr user based
    // on curr_user radious and zip

    //"result" is all users our current user hasnt seen.  from there,
    //use map/filter on the array, seeing if the current objects zipcode is
    // included in the zipcode possibilities

    return usersInRadius
  }

  /** Given a username, retireve all matches.
   *
   * Returns [{ username, firstName, lastName, }, ...]
   *
   * Throws NotFoundError if user not found.
   **/

  static async userMatches(username) {
    const matchesRes = await db.query(`
    SELECT
          interactions1.curr_user AS "currUser",
          interactions1.viewed_user AS "viewUser"
    FROM interactions AS interactions1
    INNER JOIN interactions AS interactions2
    ON interactions1.curr_user = interactions2.viewed_user
    AND interactions1.viewed_user = interactions2.curr_user
    WHERE interactions1.curr_user = $1
    AND interactions1.did_like = true
    AND interactions2.did_like = true
    ORDER BY interactions1.viewed_user`, [username],
    );

    let allMatches = matchesRes.rows;
    if (!allMatches) allMatches = {matches: "none tesing"}
    return allMatches;
  }

  //------------ABOVE ONLY --- BELOW IS FROM JOBLY ----------------


  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *   where jobs is { id, title, company_handle, company_name, state }
   *
   * Throws NotFoundError if user not found.
   **/

  // static async get(username) {
  //   const userRes = await db.query(`
  //       SELECT username,
  //              first_name AS "firstName",
  //              last_name  AS "lastName",
  //              email,
  //              is_admin   AS "isAdmin"
  //       FROM users
  //       WHERE username = $1`, [username],
  //   );

  //   const user = userRes.rows[0];

  //   if (!user) throw new NotFoundError(`No user: ${username}`);

  //   const userApplicationsRes = await db.query(`
  //       SELECT a.job_id
  //       FROM applications AS a
  //       WHERE a.username = $1`, [username]);

  //   user.applications = userApplicationsRes.rows.map(a => a.job_id);
  //   return user;
  // }



  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  // static async update(username, data) {
  //   if (data.password) {
  //     data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
  //   }

  //   const { setCols, values } = sqlForPartialUpdate(
  //       data,
  //       {
  //         firstName: "first_name",
  //         lastName: "last_name",
  //         isAdmin: "is_admin",
  //       });
  //   const usernameVarIdx = "$" + (values.length + 1);

  //   const querySql = `
  //       UPDATE users
  //       SET ${setCols}
  //       WHERE username = ${usernameVarIdx}
  //       RETURNING username,
  //           first_name AS "firstName",
  //           last_name AS "lastName",
  //           email,
  //           is_admin AS "isAdmin"`;
  //   const result = await db.query(querySql, [...values, username]);
  //   const user = result.rows[0];

  //   if (!user) throw new NotFoundError(`No user: ${username}`);

  //   delete user.password;
  //   return user;
  // }

  /** Delete given user from database; returns undefined. */

  // static async remove(username) {
  //   let result = await db.query(`
  //       DELETE
  //       FROM users
  //       WHERE username = $1
  //       RETURNING username`, [username],
  //   );
  //   const user = result.rows[0];

  //   if (!user) throw new NotFoundError(`No user: ${username}`);
  // }

  /** Apply for job: update db, returns undefined.
   *
   * - username: username applying for job
   * - jobId: job id
   **/

  // static async applyToJob(username, jobId) {
  //   const preCheck = await db.query(`
  //       SELECT id
  //       FROM jobs
  //       WHERE id = $1`, [jobId]);
  //   const job = preCheck.rows[0];

  //   if (!job) throw new NotFoundError(`No job: ${jobId}`);

  //   const preCheck2 = await db.query(`
  //       SELECT username
  //       FROM users
  //       WHERE username = $1`, [username]);
  //   const user = preCheck2.rows[0];

  //   if (!user) throw new NotFoundError(`No username: ${username}`);

  //   await db.query(`
  //       INSERT INTO applications (job_id, username)
  //       VALUES ($1, $2)`, [jobId, username]);
  // }
}


module.exports = User;