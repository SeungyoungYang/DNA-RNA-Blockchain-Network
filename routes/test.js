module.exports = function (app) {

	var express = require('express');
    var router = express.Router();

    var invoke = require('../blockchain/invoke-transaction.js');
    var query = require('../blockchain/query.js');
	var dna = require('../config/dna');
    
    var peer = dna.peer;
    var channelName = dna.channelName;
    var chaincodeName = dna.chaincodeName;
    var username = dna.username;
    var orgname = dna.orgname;
    
    router.get('/', function (req, res) {
        res.status(200);
        
        res.render('test', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'main'
		});
    });

    router.get('/history/:args', async function (req, res) {
        res.status(200);
        
        var _results_json = new Array();
        var args = [req.params.args];
        var fcn = 'queryBySeller';
        var _result;

        try {
            _result = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgname);
            if (_result == '') { }
            else {
                var _results = _result.split('&&');
                for (var i = 0; i < _results.length; i++) {
                    _results_json.push(JSON.parse(_results[i]));
                }
            }
        } catch (err) {
            console.log(err);
        }
        
        res.render('history', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
            page: 'null',
            result: _results_json
		});
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