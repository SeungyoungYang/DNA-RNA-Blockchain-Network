var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'example Host',
  user: 'example ID',
  password: 'example Password',
  database: 'example Database rna',
  port: 3306
});

module.exports = connection;