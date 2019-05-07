module.exports = function (app) {

	var express = require('express');
    var router = express.Router();

    var invoke = require('../blockchain/invoke-transaction.js');
    var query = require('../blockchain/query.js');
    
    var username = 'JGNR'
    var orgname = 'Org1'
    
    router.get('/', function (req, res) {
        res.render('test');
    });
    
    router.get('/channels/:channelName/chaincodes/:chaincodeName', async function (req, res) {
            var peer = req.query.peer;
            var chaincodeName = req.params.chaincodeName;
            var channelName = req.params.channelName;
            var fcn = req.query.fcn;
            var args = req.query.args;
    
            if (!chaincodeName) {
                    res.json(getErrorMessage('\'chaincodeName\''));
                    return;
            }
            if (!channelName) {
                    res.json(getErrorMessage('\'channelName\''));
                    return;
            }
            if (!fcn) {
                    res.json(getErrorMessage('\'fcn\''));
                    return;
            }
            if (!args) {
                    res.json(getErrorMessage('\'args\''));
                    return;
            }
    
            args = args.replace(/'/g, '"');
            args = JSON.parse(args);
    
            let message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgname);
            res.send({msg:message});
    });
    
    router.post('/channels/:channelName/chaincodes/:chaincodeName', async function (req, res) {
        var peer = req.body.peer;
        var chaincodeName = req.params.chaincodeName;
        var channelName = req.params.channelName;
        var fcn = req.body.fcn;
        var args = req.body.args;
    
        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!fcn) {
            res.json(getErrorMessage('\'fcn\''));
            return;
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }
    
        let message
        args = args.replace(/'/g, '"');
        args = JSON.parse(args);
    
        if(fcn == "query") {	
            message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgname);
        }
        else if(fcn == "queryByUserID") {	
            message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgname);
        }
        else if(fcn == "history") {
            message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgname);
        }
        else if(fcn == "tx_state") {
            message = await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, username, orgname);
        }
        
        res.send({msg:message});
    });    

	return router;
}