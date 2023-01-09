var mysql = require('mysql');
var db = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'wkddudwo1!',
  database:'codingnara'
});
db.connect();
module.exports = db;