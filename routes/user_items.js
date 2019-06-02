module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var timeStamp = Date.now();
	var readDB = require('./readDB');

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
		res.redirect('/user/items');
	})

	return router;
}