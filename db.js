var mysql = require('mysql2');
require("dotenv").config();
var db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE,
    multipleStatements: true
});
db.connect();

module.exports = db;