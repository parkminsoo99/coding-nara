var mysql = require('mysql2');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'wkddudwo1!',
    database: 'Codingnara',
    multipleStatements: true
});
db.connect();

module.exports = db;