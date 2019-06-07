var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'newbabodb.cfigsonzcith.us-east-2.rds.amazonaws.com',
    user: 'root',
    password: 'dkgk1234',
    database: 'rna',
    port: 3306
});

module.exports = connection;