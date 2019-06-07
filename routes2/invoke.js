var invoke = require('../blockchain/invoke-transaction.js');
var query = require('../blockchain/query.js');
var rna = require('../config/rna');

var peer = rna.peer;
var channelName = rna.channelName;
var chaincodeName = rna.chaincodeName;
var username = rna.username;
var orgname = rna.orgname;

var myinvoke = async function(rows, status){
    try {
        var fcn;
        if(status=='report') fcn = 'report';
        else fcn = 'tx_state';
        //	  0	      1        2		  3 		  4        5         6	        7		 8	     9	   10
        //	txID  txState  sellerID  sellerName  sellerRRN  buyerID  buyerName  buyerRRN  product  price  web
        var args = [rows[1].Number.toString(), status , rows[1].id, rows[1].Member_name, rows[1].RRN_hash, rows[0].id, rows[0].Member_name, rows[0].RRN_hash, rows[0].Product_name, rows[0].Product_price.toString(), username];
        await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, username, orgname);
    } catch (err) {
        console.log('invoke error :' + err);
    }
}  

module.exports = myinvoke;