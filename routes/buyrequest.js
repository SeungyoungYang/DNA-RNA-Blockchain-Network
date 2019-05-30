module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var mysqlDB = require('../config/db');

	var invoke = require('../blockchain/invoke-transaction.js');
	var query = require('../blockchain/query.js');
	var dna = require('../config/dna');

	var peer = dna.peer;
	var channelName = dna.channelName;
	var chaincodeName = dna.chaincodeName;
	var username = dna.username;
	var orgname = dna.orgname;

	var readpid = function (query) {
		return new Promise(function (resolve, reject) {
			mysqlDB.query(query, function (err, rows, fields) {
				var pd_id = rows.length + 1;
				resolve(pd_id);
			});
		})
	}
	var readDB = function (query) {
		return new Promise(function (resolve, reject) {
			mysqlDB.query(query, function (err, rows, fields) {
				resolve(rows);
			});
		})
	}

	router.get('/', async function (req, res) {
		var buyerID = req.session.userID;
		var query = 'select id, Member_name, RRN_hash, Product_name, Product_price\
					from newbabodb.Member, newbabodb.Product\
					where id =(select Member_id from newbabodb.Order where Product_id = ' + req.query.pid + ') and Product_id = ' + req.query.pid + '\
					union\
					select id, Member_name,RRN_hash, Product_name, Product_price\
					from newbabodb.Member, newbabodb.Product\
					where id =(select Member_id from newbabodb.Product where Product_id = ' + req.query.pid + ') and Product_id = ' + req.query.pid;
		var query2 = 'insert into newbabodb.Order value(?,?,?,?,?,?)'
		var query3 = 'UPDATE newbabodb.Product SET status=1 WHERE Product_id = ' + req.query.pid + ';';
		var order_id = await readpid('SELECT * FROM newbabodb.Order;');
		
		

		mysqlDB.query(query3, async function (err, rows__, fields) {
			if (err) {
				console.log('query error :' + err);
			} else {
				res.redirect('/product?pid=' + req.query.pid);

				mysqlDB.query(query2, [0, buyerID, req.query.pid, 1, 0, order_id], function (err, rows_, fields) {
					if (err) {
						console.log('query error :' + err);
					} else {

						mysqlDB.query(query, async function (err, rows, fields) {
							if (err) {
								console.log('query error :' + err);
							} else {
								console.log(rows)
								try {
									var fcn = 'tx_state';
									//	  0	      1        2		  3 		  4        5         6	        7		 8	     9
									//	txID  txState  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price
									var args = [order_id.toString(), 'match', rows[0].id, rows[0].Member_name, rows[0].RRN_hash, rows[1].id, rows[1].Member_name, rows[1].RRN_hash, rows[1].Product_name, rows[1].Product_price.toString()];
									await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, username, orgname);
								} catch (err) {
									console.log('invoke error :' + err);
								}
									
							}

						})
					}
				})
			}

		})

	});



	return router;
}