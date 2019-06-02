var mysqlDB = require('../config/db');

var readDB = function(query){
    return new Promise(function(resolve, reject){
        mysqlDB.query(query,  function(err, rows, fields ){
            resolve(rows);
        });
    })
}

module.exports = readDB;