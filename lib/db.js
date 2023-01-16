var mysql = require('mysql');
var db = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'ksas1300qs!!',
  database:'Codingnara',
  multipleStatements: true
});
db.connect();
module.exports = db;