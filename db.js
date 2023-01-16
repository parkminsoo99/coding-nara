var mysql = require('mysql2');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'wkddudwo1!',
    database: 'codingnara'
});
db.connect();

module.exports = db;