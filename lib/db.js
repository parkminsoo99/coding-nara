var mysql = require('mysql');
var db = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'wkddudwo1!',
  database:'usertable'
});
db.connect();
module.exports = db;