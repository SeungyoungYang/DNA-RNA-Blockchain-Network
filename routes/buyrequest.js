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
    
    var readpid = function(query){
		return new Promise(function(resolve, reject){
			mysqlDB.query(query,  function(err, rows, fields ){
				var pd_id= rows.length+1;
				resolve(pd_id);
			});
		})
	}
	var readDB = function(query){
		return new Promise(function(resolve, reject){
			mysqlDB.query(query,  function(err, rows, fields ){
				resolve(rows);
			});
		})
    }
    
	router.get('/', async function (req, res) {
		console.log(req.query.pid);
        var query = 'SELECT * FROM newbabodb.Product WHERE Product_id = '+ req.query.pid+';';
        var query2 = 'insert into newbabodb.Order value(?,?,?,?,?,?)' 
        var query3 = 'UPDATE newbabodb.Product SET status=1 WHERE Product_id = '+req.query.pid+';';
        var order_id = await readpid('SELECT * FROM newbabodb.Order;');
        var buyer_id = req.session.userID;
        console.log(buyer_id);
        mysqlDB.query(query3, async function(err,rows,fields){
            if(err){
				console.log('query error :'+err);
			}else{
				console.log(rows);
				var thisprod = await readDB(query);
				console.log(thisprod);
				res.redirect('/product?pid='+req.query.pid);
                mysqlDB.query(query2, [0, req.session.userID, req.query.pid, 1, 0,order_id], async function(err,rows_, fields){
                    if(err){
                        console.log('query error :'+err);
                    }else{
						//console.log(rows_);
						
						try {
							var fcn = 'tx_state';
							//	  0	      1        2		  3 		  4        5         6	        7		 8	     9
							//	txID  txState  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price
							var args = [req.query.pid, 'match', , req.session.userID, req.session.usernam, ];
							await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, username, orgname);
						} catch (err) {
							console.log(err);
						}
                    }
                })
            }
          
        })
        
	});



	return router;
}