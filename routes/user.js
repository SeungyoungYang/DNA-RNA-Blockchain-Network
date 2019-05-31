module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var timeStamp = Date.now();
	var mysqlDB = require('../config/db');
	
	var readDB = function(query){
		return new Promise(function(resolve, reject){
			mysqlDB.query(query,  function(err, rows, fields ){
				resolve(rows);
			});
		})
	}
	
	router.get('/items', async function (req, res) {
		res.status(200);

		var sellitemquery = 'SELECT * FROM newbabodb.Product AS Pd\
							LEFT OUTER JOIN newbabodb.Order AS Od ON Pd.Product_id = Od.Product_id WHERE Pd.Member_id =\
							\''+req.session.userID+'\';';
		var my_list = await readDB(sellitemquery);
		res.render('user_items', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'cart',
			my_items: my_list,
		});
    });
    
    router.get('/requests', async function (req, res) {
		res.status(200);

        var buyitemquery = "select * from newbabodb.Product where Product_id in\
                            (select Product_id from newbabodb.Order where Member_id ='"+req.session.userID+"')";
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

	return router;
}