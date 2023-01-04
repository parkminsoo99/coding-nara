var mysql = require('mysql2');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'wkddudwo1!',
    database: 'userTable'
});
db.connect();

module.exports = db;