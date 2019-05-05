/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.test
 */
'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('SampleWebApp');
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var util = require('util');
var app = express();
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');
var cors = require('cors');

require('./config.js');
var hfc = require('fabric-client');

var helper = require('./blockchain/helper.js');
var createChannel = require('./blockchain/create-channel.js');
var join = require('./blockchain/join-channel.js');
var updateAnchorPeers = require('./blockchain/update-anchor-peers.js');
var install = require('./blockchain/install-chaincode.js');
var instantiate = require('./blockchain/instantiate-chaincode.js');
var invoke = require('./blockchain/invoke-transaction.js');
var query = require('./blockchain/query.js');
var host = process.env.HOST || hfc.getConfigSetting('host');
var port = process.env.PORT || hfc.getConfigSetting('port');
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// SET CONFIGURATONS ////////////////////////////
///////////////////////////////////////////////////////////////////////////////
app.set('views', './views');
app.set('view engine', 'ejs');
app.options('*', cors());
app.use(cors());
//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
	extended: false
}));
// set secret variable


///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// START SERVER /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

var server = http.createServer(app).listen(port, function() {});

logger.info('****************** SERVER STARTED ************************');
logger.info('***************  http://%s:%s  ******************',host,port);
server.timeout = 240000;

function getErrorMessage(field) {
	var response = {
		success: false,
		message: field + ' field is missing or Invalid in the request'
	};
	return response;
}

app.get('/test', function (req, res) {
	res.render('index');
});

app.get('/test/:channelName/chaincodes/:chaincodeName', async function (req, res) {
        var peer = req.query.peer;
        var chaincodeName = req.params.chaincodeName;
        var channelName = req.params.channelName;
        var fcn = req.query.fcn;
        var args = req.query.args;
		req.username = 'JGNR'
		req.orgname = 'Org1'

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

        let message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname);
        res.send({msg:message});
});

app.post('/test/:channelName/chaincodes/:chaincodeName', async function (req, res) {
	var peer = req.body.peer;
	var chaincodeName = req.params.chaincodeName;
	var channelName = req.params.channelName;
	var fcn = req.body.fcn;
	var args = req.body.args;
	req.username = 'JGNR'
	req.orgname = 'Org1'

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
		message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname);
	}
	else if(fcn == "queryByUserID") {	
		message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname);
	}
	else if(fcn == "history") {
		message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname);
	}
	else if(fcn == "tx_state") {
		message = await invoke.invokeChaincode(peer, channelName, chaincodeName, fcn, args, req.username, req.orgname);
	}
	res.send({msg:message});
});

