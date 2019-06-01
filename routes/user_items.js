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

		//console.log(req.session);
		//req.session.userID
		var sellitemquery = 'SELECT * FROM newbabodb.Product AS Pd ';
		sellitemquery+='LEFT OUTER JOIN newbabodb.Order AS Od ON Pd.Product_id = Od.Product_id WHERE Pd.Member_id =' ;
		sellitemquery += '\''+req.session.userID+'\';';		
		console.log(sellitemquery);
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

	router.get('/cancel', async function (req, res){
		var cancelquery = 'DELETE FROM newbabodb.Order WHERE Number='+'\''+req.query.num+'\';';
		var cancelquery2 = 'UPDATE newbabodb.Product SET status=0 WHERE Product_id='+'\''+req.query.item+'\';';
		await readDB(cancelquery);
		await readDB(cancelquery2);
		res.redirect('/user_items');
	});

	router.post('/invoice', async function(req, res){
		var invoice = req.body['invoice'];
		var number = req.body['number'];
		var pd_id = req.body['pd_id'];
		var invoicequery = 'UPDATE newbabodb.Order SET invoice_number='+'\''+invoice+'\'';
		invoicequery += ' WHERE Number='+'\''+number+'\';';
		var changestatusquery = 'UPDATE newbabodb.Product SET status=2 WHERE Product_id='+'\''+pd_id+'\';';
		await readDB(invoicequery);
		await readDB(changestatusquery);
		res.redirect('/user_items');
	})

	return router;
}