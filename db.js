var mysql = require('mysql2');
var db = mysql.createConnection({
    host: 'database-1.cogybem1ric1.ap-northeast-1.rds.amazonaws.com',
    user: 'zzangorc99',
    password: 'codingnara11223344',
    database: 'codingnara',
    multipleStatements: true
});
db.connect();

module.exports = db;