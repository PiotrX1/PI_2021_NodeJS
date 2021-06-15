"use strict";

var knex = require("knex");

var connectedKnex = knex({
  client: "sqlite3",
  connection: {
    filename: "data.db"
  }
});
module.exports = connectedKnex;