var mysql = require('mysql2');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ksas1300qs!!',
    database: 'codingnara',
    multipleStatements: true
});
db.connect();

module.exports = db;