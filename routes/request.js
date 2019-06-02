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

	var readDB = function(query){
		return new Promise(function(resolve, reject){
			mysqlDB.query(query,  function(err, rows, fields ){
				console.log(rows);
				resolve(rows);
			});
		})
	}

	router.get('/history/:args', async function (req, res) {
        res.status(200);

        var _type = req.query.type;
        var _results_json = new Array();
        var queryString = "SELECT RRN_hash FROM Member WHERE id = " + "'" + req.params.args + "'";
        
        mysqlDB.query(queryString, async function (err, rows, fields) {
            if (err) {
                console.log('query error :' + err);
            } else {
                var args = [rows[0].RRN_hash];
                var fcn = 'queryBySeller';
                var _result;
                try {
                    _result = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgname);
                    if (_result == '');
                    else {
                        var _results = _result.split('&&');
                        for (var i = 0; i < _results.length; i++) {
                            _results_json.push(JSON.parse(_results[i]));
                        }
                    }

                    res.render('history', {
                        login: req.session.login,
                        userid: req.session.userID,
                        username: req.session.username,
                        authority: req.session.authority,
                        page: 'null',
                        result: _results_json,
                        sellerID: req.params.args,
                        type: _type
                    });

                } catch (err) {
                    console.log(err);
                }
            }
        })
        
    });

	router.get('/match', async function (req, res) {
		var query = 'select id,Member_name,RRN_hash,Product_name,Product_price,Number\
					from newbabodb.Member, newbabodb.Product, newbabodb.Order\
					where id =(select Member_id from newbabodb.Order where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid + '\
					union\
					select id,Member_name,RRN_hash,Product_name,Product_price, Number\
					from newbabodb.Member, newbabodb.Product, newbabodb.Order\
					where id =(select Member_id from newbabodb.Product where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid;
		var query2 = 'insert into newbabodb.Order (invoice_number, Member_id, Product_id, Product_status,status_read) values(?,?,?,?,?)';
		var query3 = 'UPDATE newbabodb.Product SET status=1 WHERE Product_id = ' + req.query.pid + ';';

		mysqlDB.query(query3, async function (err, rows__, fields) {
			if (err) {
				console.log('query3 error :' + err);
			} else {
				mysqlDB.query(query2, [0, req.session.userID, req.query.pid, 1, 0], function (err, rows_, fields) {
					if (err) {
						console.log('query2 error :' + err);
					} else {
						mysqlDB.query(query, async function (err, rows, fields) {
							if (err) {
								console.log(rows);
								console.log('query error :' + err);
							} else {
								try {
									var fcn = 'tx_state';
									//	  0	      1        2		  3 		  4        5         6	        7		 8	     9	   10
									//	txID  txState  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price  web
									var args = [rows[1].Number.toString(), 'match', rows[1].id, rows[1].Member_name, rows[1].RRN_hash, rows[0].id, rows[0].Member_name, rows[0].RRN_hash, rows[0].Product_name, rows[0].Product_price.toString(), username];
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
	
	router.post('/shipping', async function (req, res) {
		var invoice = req.body['invoice'];
		var number = req.body['number'];
		var pid = req.body['pd_id'];
		var query = 'select id,Member_name,RRN_hash,Product_name,Product_price,Number\
					from newbabodb.Member, newbabodb.Product, newbabodb.Order\
					where id =(select Member_id from newbabodb.Order where Product_id = ' + pid + ') and Product.Product_id = ' + pid + ' and Order.Product_id = ' + pid + '\
					union\
					select id,Member_name,RRN_hash,Product_name,Product_price, Number\
					from newbabodb.Member, newbabodb.Product, newbabodb.Order\
					where id =(select Member_id from newbabodb.Product where Product_id = ' + pid + ') and Product.Product_id = ' + pid + ' and Order.Product_id = ' + pid;
		var invoicequery = 'UPDATE newbabodb.Order SET invoice_number='+'\''+invoice+'\'\
							WHERE Number='+'\''+number+'\';';
		var changestatusquery = 'UPDATE newbabodb.Product SET status=2 WHERE Product_id = ' + pid + ';';

		console.log(req.body);
		mysqlDB.query(query, async function (err, rows, fields) {
			if (err) {
				console.log('query error :' + err);
			} else {
				try {
					var fcn = 'tx_state';
					//	  0	      1        2		  3 		  4        5         6	        7		 8	     9	   10
					//	txID  txState  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price  web
					var args = [rows[1].Number.toString(), 'shipping', rows[1].id, rows[1].Member_name, rows[1].RRN_hash, rows[0].id, rows[0].Member_name, rows[0].RRN_hash, rows[0].Product_name, rows[0].Product_price.toString(), username];
					await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, username, orgname);
					await readDB(invoicequery);
					await readDB(changestatusquery);
				} catch (err) {
					console.log('invoke error :' + err);
				}
			}
		})
		res.redirect('/user/items');

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
				console.log('query3 error :' + err);
			} else {
				mysqlDB.query(query, async function (err, rows, fields) {
					if (err) {
						console.log('query error :' + err);
					} else {
						try {
							var fcn = 'tx_state';
							//	  0	      1        2		  3 		  4        5         6	        7		 8	     9	   10
							//	txID  txState  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price  web
							var args = [rows[1].Number.toString(), 'finish', rows[1].id, rows[1].Member_name, rows[1].RRN_hash, rows[0].id, rows[0].Member_name, rows[0].RRN_hash, rows[0].Product_name, rows[0].Product_price.toString(), username];
							await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, username, orgname);
						} catch (err) {
							console.log('invoke error :' + err);
						}
						mysqlDB.query(query2 + rows[1].Number, function (err, rows_, fields) {
							if (err) {
								console.log('query2 error :' + err);
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
		var query2 = 'DELETE FROM newbabodb.Order WHERE Product_id='+'\''+req.query.pid+'\'';
		var query3 = 'UPDATE newbabodb.Product SET status=0 WHERE Product_id = ' + req.query.pid + ';';

		mysqlDB.query(query3, async function (err, rows__, fields) {
			if (err) {
				console.log('query3 error :' + err);
			} else {

				mysqlDB.query(query, async function (err, rows, fields) {
					if (err) {
						console.log('query error :' + err);
					} else {
						try {
							var fcn = 'tx_state';
							//	  0	      1        2		  3 		  4        5         6	        7		 8	     9	   10
							//	txID  txState  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price  web
							var args = [rows[1].Number.toString(), 'cancel', rows[1].id, rows[1].Member_name, rows[1].RRN_hash, rows[0].id, rows[0].Member_name, rows[0].RRN_hash, rows[0].Product_name, rows[0].Product_price.toString(), username];
							await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, username, orgname);
						} catch (err) {
							console.log('invoke error :' + err);
						}
						mysqlDB.query(query2, function (err, rows_, fields) {
							if (err) {
								console.log('query2 error :' + err);
							} else {
								res.redirect('back');
							}
						})
					}
				})
			}

		})

	});
	
	router.get('/report', async function (req, res) {
		var query = 'select id,Member_name,RRN_hash,Product_name,Product_price,Number\
					from newbabodb.Member, newbabodb.Product, newbabodb.Order\
					where id =(select Member_id from newbabodb.Order where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid + '\
					union\
					select id,Member_name,RRN_hash,Product_name,Product_price, Number\
					from newbabodb.Member, newbabodb.Product, newbabodb.Order\
					where id =(select Member_id from newbabodb.Product where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid;
		var query2 = 'DELETE * newbabodb.Order WHERE Number = ';
		var query3 = 'UPDATE newbabodb.Product SET status=4 WHERE Product_id = ' + req.query.pid + ';';

		mysqlDB.query(query3, async function (err, rows__, fields) {
			if (err) {
				console.log('query3 error :' + err);
			} else {
				mysqlDB.query(query, async function (err, rows, fields) {
					if (err) {
						console.log('query error :' + err);
					} else {
						try {
							var fcn = 'report';
							//	  0	     1   	   2		 3 	   	     4        5          6	        7        8	     9     10
							//	txID  details  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price  web
							var args = [rows[1].Number.toString(), 'report', rows[1].id, rows[1].Member_name, rows[1].RRN_hash, rows[0].id, rows[0].Member_name, rows[0].RRN_hash, rows[0].Product_name, rows[0].Product_price.toString(), username];
							await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, username, orgname);
						} catch (err) {
							console.log('invoke error :' + err);
						}
						mysqlDB.query(query2 + rows[1].Number, function (err, rows_, fields) {
							if (err) {
								console.log('query2 error :' + err);
							} else {
								res.redirect('/user/requests');
							}
						})
					}
				})
			}

		})

	});

	return router;
}