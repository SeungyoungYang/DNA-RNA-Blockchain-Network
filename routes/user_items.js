module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var timeStamp = Date.now();
	var mysqlDB = require('../config/db');
	
	router.get('/', function (req, res) {
		res.status(200);

		//console.log(req.session);
		//req.session.userID
		sellitemquery = 'SELECT * FROM newbabodb.Product AS Pd INNER JOIN newbabodb.Order AS Od ON Pd.Product_id = Od.Product_id WHERE Pd.Member_id =';
		sellitemquery += '\''+req.session.userID+'\';';
		querystring = 'SELECT * FROM newbabodb.Product where Member_id=';
		querystring += '\''+req.session.userID+'\'';
		//console.log(querystring);
		mysqlDB.query(sellitemquery,function(err, rows, fields ){
			if(err){
				console.log('query error :'+err);
			}
			console.log(rows);
			//console.log(rows[0].Member_id);
			res.render('user_items', {
				login: req.session.login,
				userid: req.session.userID,
				username: req.session.username,
				authority: req.session.authority,
				page: 'cart',
				my_items: rows
			});
		})
	});

	return router;
}