module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var timeStamp = Date.now();
	var mysqlDB = require('../config/db');
	
	var readDB = function(query){
		return new Promise(function(resolve, reject){
			mysqlDB.query(query,  function(err, rows, fields ){
				console.log(rows);
				resolve(rows);
			});
		})
	}
	
	router.get('/', async function (req, res) {
		res.status(200);

		var buyitemquery = 
        "select * from newbabodb.Product \
        where Product_id in (select Product_id from newbabodb.Order where Member_id ='"+req.session.userID+"')";
		console.log(buyitemquery);
		var my_list = await readDB(buyitemquery);
		res.render('user_requests', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'cart',
			my_request: my_list,
		});
	});

	router.get('/cancel', async function (req, res){
		var cancelquery = 'UPDATE newbabodb.Order SET Product_status=-1 WHERE Number='+'\''+req.query.num+'\'';
		var cancelquery2 = 'UPDATE newbabodb.Product SET status=0 WHERE Product_id='+'\''+req.query.item+'\'';
		console.log(cancelquery);
		console.log(cancelquery2);
		await readDB(cancelquery);
		await readDB(cancelquery2);
		res.redirect('/user_requests');
	})
	return router;
}