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

	router.get('/match', async function (req, res) {
		var buyerID = req.session.userID;
		var query = 'select id,Member_name,RRN_hash,Product_name,Product_price,Number\
					from newbabodb.Member, newbabodb.Product, newbabodb.Order\
					where id =(select Member_id from newbabodb.Order where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid + '\
					union\
					select id,Member_name,RRN_hash,Product_name,Product_price, Number\
					from newbabodb.Member, newbabodb.Product, newbabodb.Order\
					where id =(select Member_id from newbabodb.Product where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid;
		var query2 = 'insert into newbabodb.Order value(?,?,?,?,?)'
		var query3 = 'UPDATE newbabodb.Product SET status=1 WHERE Product_id = ' + req.query.pid + ';';

		mysqlDB.query(query3, async function (err, rows__, fields) {
			if (err) {
				console.log('query error :' + err);
			} else {

				mysqlDB.query(query2, [0, buyerID, req.query.pid, 1, 0], function (err, rows_, fields) {
					if (err) {
						console.log('query error :' + err);
					} else {
						mysqlDB.query(query, async function (err, rows, fields) {
							if (err) {
								console.log('query error :' + err);
							} else {
								try {
									var fcn = 'tx_state';
									//	  0	      1        2		  3 		  4        5         6	        7		 8	     9
									//	txID  txState  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price
									var args = [rows[1].Number.toString(), 'match', rows[1].id, rows[1].Member_name, rows[1].RRN_hash, rows[0].id, rows[0].Member_name, rows[0].RRN_hash, rows[0].Product_name, rows[0].Product_price.toString()];
									await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, username, orgname);
								} catch (err) {
									console.log('invoke error :' + err);
								}
							}

						})
						res.redirect('/product?pid=' + req.query.pid);
					}
				})
			}

		})

	});
	
	router.get('/shipping', async function (req, res) {
		var query = 'select id,Member_name,RRN_hash,Product_name,Product_price,Number\
					from newbabodb.Member, newbabodb.Product, newbabodb.Order\
					where id =(select Member_id from newbabodb.Order where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid + '\
					union\
					select id,Member_name,RRN_hash,Product_name,Product_price, Number\
					from newbabodb.Member, newbabodb.Product, newbabodb.Order\
					where id =(select Member_id from newbabodb.Product where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid;
		var query2 = 'UPDATE newbabodb.Product SET status=2 WHERE Product_id = ' + req.query.pid + ';';

		mysqlDB.query(query2, async function (err, rows__, fields) {
			if (err) {
				console.log('query error :' + err);
			} else {
				res.redirect('/product?pid=' + req.query.pid);

				mysqlDB.query(query, async function (err, rows, fields) {
					if (err) {
						console.log('query error :' + err);
					} else {
						try {
							var fcn = 'tx_state';
							//	  0	      1        2		  3 		  4        5         6	        7		 8	     9
							//	txID  txState  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price
							var args = [rows[1].Number.toString(), 'shipping', rows[1].id, rows[1].Member_name, rows[1].RRN_hash, rows[0].id, rows[0].Member_name, rows[0].RRN_hash, rows[0].Product_name, rows[0].Product_price.toString()];
							await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, username, orgname);
						} catch (err) {
							console.log('invoke error :' + err);
						}
						res.redirect('/product?pid=' + req.query.pid);
					}
				})
			}

		})

	});

	router.get('/finish', async function (req, res) {
		var query = 'select id,Member_name,RRN_hash,Product_name,Product_price,Number\
					from newbabodb.Member, newbabodb.Product, newbabodb.Order\
					where id =(select Member_id from newbabodb.Order where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid + '\
					union\
					select id,Member_name,RRN_hash,Product_name,Product_price, Number\
					from newbabodb.Member, newbabodb.Product, newbabodb.Order\
					where id =(select Member_id from newbabodb.Product where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid;
		var query2 = 'DELETE * newbabodb.Order WHERE Number = ';
		var query3 = 'UPDATE newbabodb.Product SET status=3 WHERE Product_id = ' + req.query.pid + ';';

		mysqlDB.query(query3, async function (err, rows__, fields) {
			if (err) {
				console.log('query error :' + err);
			} else {
				res.redirect('/product?pid=' + req.query.pid);

				mysqlDB.query(query, async function (err, rows, fields) {
					if (err) {
						console.log('query error :' + err);
					} else {
						try {
							var fcn = 'tx_state';
							//	  0	      1        2		  3 		  4        5         6	        7		 8	     9
							//	txID  txState  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price
							var args = [rows[1].Number.toString(), 'finish', rows[1].id, rows[1].Member_name, rows[1].RRN_hash, rows[0].id, rows[0].Member_name, rows[0].RRN_hash, rows[0].Product_name, rows[0].Product_price.toString()];
							await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, username, orgname);
						} catch (err) {
							console.log('invoke error :' + err);
						}
						mysqlDB.query(query2 + rows[1].Number, function (err, rows_, fields) {
							if (err) {
								console.log('query error :' + err);
							} else {
								res.redirect('/product?pid=' + req.query.pid);
							}
						})
					}
				})
			}

		})

	});

	router.get('/cancel', async function (req, res) {
		var query = 'select id,Member_name,RRN_hash,Product_name,Product_price,Number\
					from newbabodb.Member, newbabodb.Product, newbabodb.Order\
					where id =(select Member_id from newbabodb.Order where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid + '\
					union\
					select id,Member_name,RRN_hash,Product_name,Product_price, Number\
					from newbabodb.Member, newbabodb.Product, newbabodb.Order\
					where id =(select Member_id from newbabodb.Product where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid;
		var query2 = 'DELETE * newbabodb.Order WHERE Number = ';
		var query3 = 'UPDATE newbabodb.Product SET status=0 WHERE Product_id = ' + req.query.pid + ';';

		mysqlDB.query(query3, async function (err, rows__, fields) {
			if (err) {
				console.log('query error :' + err);
			} else {
				res.redirect('/product?pid=' + req.query.pid);

				mysqlDB.query(query, async function (err, rows, fields) {
					if (err) {
						console.log('query error :' + err);
					} else {
						try {
							var fcn = 'tx_state';
							//	  0	      1        2		  3 		  4        5         6	        7		 8	     9
							//	txID  txState  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price
							var args = [rows[1].Number.toString(), 'cancel', rows[1].id, rows[1].Member_name, rows[1].RRN_hash, rows[0].id, rows[0].Member_name, rows[0].RRN_hash, rows[0].Product_name, rows[0].Product_price.toString()];
							await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, username, orgname);
						} catch (err) {
							console.log('invoke error :' + err);
						}
						mysqlDB.query(query2 + rows[1].Number, function (err, rows_, fields) {
							if (err) {
								console.log('query error :' + err);
							} else {
								res.redirect('/product?pid=' + req.query.pid);
							}
						})
					}
				})
			}

		})

	});

	return router;
}