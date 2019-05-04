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

var helper = require('./app/helper.js');
var createChannel = require('./app/create-channel.js');
var join = require('./app/join-channel.js');
var updateAnchorPeers = require('./app/update-anchor-peers.js');
var install = require('./app/install-chaincode.js');
var instantiate = require('./app/instantiate-chaincode.js');
var invoke = require('./app/invoke-transaction.js');
var query = require('./app/query.js');
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

var server = http.createServer(app).listen(port, function() {
	networkInit()
});
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

async function networkInit(){
	// Register and enroll user
	var username1 = 'JGNR'
	var orgname1 = 'Org1'
	var username2 = 'BGJT'
	var orgname2 = 'Org2'
	await helper.getRegisteredUser(username1, orgname1, true);
	logger.debug('Successfully registered the username %s for organization %s',username1,orgname1);
	await helper.getRegisteredUser(username2, orgname2, true);
	logger.debug('Successfully registered the username %s for organization %s',username2,orgname2);

	// Create Channel
	logger.info('<<<<<<<<<<<<<<<<< C R E A T E  C H A N N E L >>>>>>>>>>>>>>>>>');
	var channelName = 'mychannel';
	var channelConfigPath = "../artifacts/channel/mychannel.tx";
	logger.debug('Channel name : ' + channelName);
	logger.debug('channelConfigPath : ' + channelConfigPath);
	await createChannel.createChannel(channelName, channelConfigPath, username1, orgname1);

	// Join Channel
	logger.info('<<<<<<<<<<<<<<<<< J O I N  C H A N N E L >>>>>>>>>>>>>>>>>');
	var peers = ["peer0.org1.example.com","peer1.org1.example.com"];
	logger.debug('channelName : ' + channelName);
	logger.debug('peers : ' + peers);
	logger.debug('username :' + username1);
	logger.debug('orgname:' + orgname1);
	await join.joinChannel(channelName, peers, username1, orgname1);

	var peers = ["peer0.org2.example.com","peer1.org2.example.com"];
	logger.debug('channelName : ' + channelName);
	logger.debug('peers : ' + peers);
	logger.debug('username :' + username2);
	logger.debug('orgname:' + orgname2);
	await join.joinChannel(channelName, peers, username2, orgname2);
	
	// Update anchor peers
	logger.debug('==================== UPDATE ANCHOR PEERS ==================');
	var configUpdatePath = "../artifacts/channel/Org1MSPanchors.tx";
	logger.debug('Channel name : ' + channelName);
	logger.debug('configUpdatePath : ' + configUpdatePath);
	await updateAnchorPeers.updateAnchorPeers(channelName, configUpdatePath, username1, orgname1);

	var configUpdatePath = "../artifacts/channel/Org2MSPanchors.tx";
	logger.debug('configUpdatePath : ' + configUpdatePath);
	await updateAnchorPeers.updateAnchorPeers(channelName, configUpdatePath, username2, orgname2);
	
	// Install chaincode on target peers
	logger.debug('==================== INSTALL CHAINCODE ==================');
	var peers = ["peer0.org1.example.com","peer1.org1.example.com"];
	var chaincodeName = 'mycc';
	var chaincodePath = "github.com/example_cc/go";
	var chaincodeVersion = 'v0';
	var chaincodeType = 'golang';
	logger.debug('peers : ' + peers); // target peers list
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodePath  : ' + chaincodePath);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	logger.debug('chaincodeType  : ' + chaincodeType);
	await install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, chaincodeType, username1, orgname1)
	
	var peers = ["peer0.org2.example.com","peer1.org2.example.com"];
	logger.debug('peers : ' + peers); // target peers list
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodePath  : ' + chaincodePath);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	logger.debug('chaincodeType  : ' + chaincodeType);
	await install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, chaincodeType, username2, orgname2)
	
	// Instantiate chaincode on target peers
	logger.debug('==================== INSTANTIATE CHAINCODE ==================');
	//var fcn = req.body.fcn;
	var peers = ["peer0.org1.example.com","peer1.org1.example.com","peer0.org2.example.com","peer1.org2.example.com"];
	var args = ["a","100","b","200"];
	var fcn = 'init';
	logger.debug('peers  : ' + peers);
	logger.debug('channelName  : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	logger.debug('chaincodeType  : ' + chaincodeType);
	logger.debug('args  : ' + args);
	await instantiate.instantiateChaincode(peers, channelName, chaincodeName, chaincodeVersion, fcn, chaincodeType, args, username1, orgname1);

	logger.debug('==================== FINISH INIT BLOCKCHAIN NETWORK ==================');
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////// REST ENDPOINTS START HERE ///////////////////////////
///////////////////////////////////////////////////////////////////////////////
app.get('/test', function (req, res) {
	res.render('index');
});

app.get('/test/:channelName/chaincodes/:chaincodeName', async function (req, res) {
        var peer = req.query.peer;
        var chaincodeName = req.params.chaincodeName;
        var channelName = req.params.channelName;
        var fcn = req.query.fcn;
        var args = req.query.args;
        console.log('check');
		console.log(req.query);
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
       // console.log(message);
        res.send({msg:message});
});


app.post('/test/:channelName/chaincodes/:chaincodeName', async function (req, res) {
	var peer = req.body.peer;
	var chaincodeName = req.params.chaincodeName;
	var channelName = req.params.channelName;
	var fcn = req.body.fcn;
	var args = req.body.args;
	console.log('check');
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
	//console.log(message);
	res.send({msg:message});
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Register and enroll user
app.post('/users', async function(req, res) {
	var username = req.body.username;
	var orgName = req.body.orgName;
	logger.debug('End point : /users');
	logger.debug('User name : ' + username);
	logger.debug('Org name  : ' + orgName);
	if (!username) {
		res.json(getErrorMessage('\'username\''));
		return;
	}
	if (!orgName) {
		res.json(getErrorMessage('\'orgName\''));
		return;
	}
	var token = jwt.sign({
		exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		username: username,
		orgName: orgName
	}, app.get('secret'));
	let response = await helper.getRegisteredUser(username, orgName, true);
	logger.debug('-- returned from registering the username %s for organization %s',username,orgName);
	if (response && typeof response !== 'string') {
		logger.debug('Successfully registered the username %s for organization %s',username,orgName);
		response.token = token;
		res.json(response);
	} else {
		logger.debug('Failed to register the username %s for organization %s with::%s',username,orgName,response);
		res.json({success: false, message: response});
	}

});
// Create Channel
app.post('/channels', async function(req, res) {
	logger.info('<<<<<<<<<<<<<<<<< C R E A T E  C H A N N E L >>>>>>>>>>>>>>>>>');
	logger.debug('End point : /channels');
	var channelName = req.body.channelName;
	var channelConfigPath = req.body.channelConfigPath;
	logger.debug('Channel name : ' + channelName);
	logger.debug('channelConfigPath : ' + channelConfigPath); //../artifacts/channel/mychannel.tx
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!channelConfigPath) {
		res.json(getErrorMessage('\'channelConfigPath\''));
		return;
	}

	let message = await createChannel.createChannel(channelName, channelConfigPath, req.username, req.orgname);
	res.send(message);
});
// Join Channel
app.post('/channels/:channelName/peers', async function(req, res) {
	logger.info('<<<<<<<<<<<<<<<<< J O I N  C H A N N E L >>>>>>>>>>>>>>>>>');
	var channelName = req.params.channelName;
	var peers = req.body.peers;
	logger.debug('channelName : ' + channelName);
	logger.debug('peers : ' + peers);
	logger.debug('username :' + req.username);
	logger.debug('orgname:' + req.orgname);

	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}

	let message =  await join.joinChannel(channelName, peers, req.username, req.orgname);
	res.send(message);
});
// Update anchor peers
app.post('/channels/:channelName/anchorpeers', async function(req, res) {
	logger.debug('==================== UPDATE ANCHOR PEERS ==================');
	var channelName = req.params.channelName;
	var configUpdatePath = req.body.configUpdatePath;
	logger.debug('Channel name : ' + channelName);
	logger.debug('configUpdatePath : ' + configUpdatePath);
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!configUpdatePath) {
		res.json(getErrorMessage('\'configUpdatePath\''));
		return;
	}

	let message = await updateAnchorPeers.updateAnchorPeers(channelName, configUpdatePath, req.username, req.orgname);
	res.send(message);
});
// Install chaincode on target peers
app.post('/chaincodes', async function(req, res) {
	logger.debug('==================== INSTALL CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.body.chaincodeName;
	var chaincodePath = req.body.chaincodePath;
	var chaincodeVersion = req.body.chaincodeVersion;
	var chaincodeType = req.body.chaincodeType;
	logger.debug('peers : ' + peers); // target peers list
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodePath  : ' + chaincodePath);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	logger.debug('chaincodeType  : ' + chaincodeType);
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!chaincodePath) {
		res.json(getErrorMessage('\'chaincodePath\''));
		return;
	}
	if (!chaincodeVersion) {
		res.json(getErrorMessage('\'chaincodeVersion\''));
		return;
	}
	if (!chaincodeType) {
		res.json(getErrorMessage('\'chaincodeType\''));
		return;
	}
	let message = await install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, chaincodeType, req.username, req.orgname)
	res.send(message);});
// Instantiate chaincode on target peers
app.post('/channels/:channelName/chaincodes', async function(req, res) {
	logger.debug('==================== INSTANTIATE CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.body.chaincodeName;
	var chaincodeVersion = req.body.chaincodeVersion;
	var channelName = req.params.channelName;
	var chaincodeType = req.body.chaincodeType;
	var fcn = req.body.fcn;
	var args = req.body.args;
	logger.debug('peers  : ' + peers);
	logger.debug('channelName  : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	logger.debug('chaincodeType  : ' + chaincodeType);
	logger.debug('fcn  : ' + fcn);
	logger.debug('args  : ' + args);
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!chaincodeVersion) {
		res.json(getErrorMessage('\'chaincodeVersion\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!chaincodeType) {
		res.json(getErrorMessage('\'chaincodeType\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}

	let message = await instantiate.instantiateChaincode(peers, channelName, chaincodeName, chaincodeVersion, chaincodeType, fcn, args, req.username, req.orgname);
	res.send(message);
});
// Invoke transaction on chaincode on target peers
app.post('/channels/:channelName/chaincodes/:chaincodeName', async function(req, res) {
	logger.debug('==================== INVOKE ON CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.params.chaincodeName;
	var channelName = req.params.channelName;
	var fcn = req.body.fcn;
	var args = req.body.args;
	logger.debug('channelName  : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn  : ' + fcn);
	logger.debug('args  : ' + args);
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

	let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.username, req.orgname);
	res.send(message);
});
// Query on chaincode on target peers
app.get('/channels/:channelName/chaincodes/:chaincodeName', async function(req, res) {
	logger.debug('==================== QUERY BY CHAINCODE ==================');
	var channelName = req.params.channelName;
	var chaincodeName = req.params.chaincodeName;
	let args = req.query.args;
	let fcn = req.query.fcn;
	let peer = req.query.peer;

	logger.debug('channelName : ' + channelName);
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('fcn : ' + fcn);
	logger.debug('args : ' + args);

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
	logger.debug(args);

	let message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname);
	res.send(message);
});
//  Query Get Block by BlockNumber
app.get('/channels/:channelName/blocks/:blockId', async function(req, res) {
	logger.debug('==================== GET BLOCK BY NUMBER ==================');
	let blockId = req.params.blockId;
	let peer = req.query.peer;
	logger.debug('channelName : ' + req.params.channelName);
	logger.debug('BlockID : ' + blockId);
	logger.debug('Peer : ' + peer);
	if (!blockId) {
		res.json(getErrorMessage('\'blockId\''));
		return;
	}

	let message = await query.getBlockByNumber(peer, req.params.channelName, blockId, req.username, req.orgname);
	res.send(message);
});
// Query Get Transaction by Transaction ID
app.get('/channels/:channelName/transactions/:trxnId', async function(req, res) {
	logger.debug('================ GET TRANSACTION BY TRANSACTION_ID ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let trxnId = req.params.trxnId;
	let peer = req.query.peer;
	if (!trxnId) {
		res.json(getErrorMessage('\'trxnId\''));
		return;
	}

	let message = await query.getTransactionByID(peer, req.params.channelName, trxnId, req.username, req.orgname);
	res.send(message);
});
// Query Get Block by Hash
app.get('/channels/:channelName/blocks', async function(req, res) {
	logger.debug('================ GET BLOCK BY HASH ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let hash = req.query.hash;
	let peer = req.query.peer;
	if (!hash) {
		res.json(getErrorMessage('\'hash\''));
		return;
	}

	let message = await query.getBlockByHash(peer, req.params.channelName, hash, req.username, req.orgname);
	res.send(message);
});
//Query for Channel Information
app.get('/channels/:channelName', async function(req, res) {
	logger.debug('================ GET CHANNEL INFORMATION ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let peer = req.query.peer;

	let message = await query.getChainInfo(peer, req.params.channelName, req.username, req.orgname);
	res.send(message);
});
//Query for Channel instantiated chaincodes
app.get('/channels/:channelName/chaincodes', async function(req, res) {
	logger.debug('================ GET INSTANTIATED CHAINCODES ======================');
	logger.debug('channelName : ' + req.params.channelName);
	let peer = req.query.peer;

	let message = await query.getInstalledChaincodes(peer, req.params.channelName, 'instantiated', req.username, req.orgname);
	res.send(message);
});
// Query to fetch all Installed/instantiated chaincodes
app.get('/chaincodes', async function(req, res) {
	var peer = req.query.peer;
	var installType = req.query.type;
	logger.debug('================ GET INSTALLED CHAINCODES ======================');

	let message = await query.getInstalledChaincodes(peer, null, 'installed', req.username, req.orgname)
	res.send(message);
});
// Query to fetch channels
app.get('/channels', async function(req, res) {
	logger.debug('================ GET CHANNELS ======================');
	logger.debug('peer: ' + req.query.peer);
	var peer = req.query.peer;
	if (!peer) {
		res.json(getErrorMessage('\'peer\''));
		return;
	}

	let message = await query.getChannels(peer, req.username, req.orgname);
	res.send(message);
});
