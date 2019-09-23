'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('SampleWebApp');

require('./config.js');

var helper = require('./blockchain/helper.js');
var createChannel = require('./blockchain/create-channel.js');
var join = require('./blockchain/join-channel.js');
var updateAnchorPeers = require('./blockchain/update-anchor-peers.js');
var install = require('./blockchain/install-chaincode.js');
var instantiate = require('./blockchain/instantiate-chaincode.js');
var dna = require('./config/dna');
var rna = require('./config/rna');

networkInit();

async function networkInit(){
	// Register and enroll user
	var username1 = dna.username;
	var orgname1 = dna.orgname;
	var username2 = rna.username;
	var orgname2 = rna.orgname;

	await helper.getRegisteredUser(username1, orgname1, true);
	logger.debug('Successfully registered the username %s for organization %s',username1,orgname1);
	await helper.getRegisteredUser(username2, orgname2, true);
	logger.debug('Successfully registered the username %s for organization %s',username2,orgname2);

	// Create Channel
	logger.info('<<<<<<<<<<<<<<<<< C R E A T E  C H A N N E L >>>>>>>>>>>>>>>>>');
	var channelName = dna.channelName;
	var channelConfigPath = "../artifacts/channel/mychannel.tx";
	logger.debug('Channel name : ' + channelName);
	logger.debug('channelConfigPath : ' + channelConfigPath);
	await createChannel.createChannel(channelName, channelConfigPath, username1, orgname1);

	// Join Channel
	logger.info('<<<<<<<<<<<<<<<<< J O I N  C H A N N E L >>>>>>>>>>>>>>>>>');
	logger.debug('channelName : ' + channelName);
	logger.debug('peers : ' + [dna.peer]);
	logger.debug('username :' + username1);
	logger.debug('orgname:' + orgname1);
	await join.joinChannel(channelName, [dna.peer], username1, orgname1);
	logger.debug('peers : ' + [rna.peer]);
	logger.debug('username :' + username2);
	logger.debug('orgname:' + orgname2);
	await join.joinChannel(channelName, [rna.peer], username2, orgname2);

	// Update anchor peers
	logger.debug('==================== UPDATE ANCHOR PEERS ==================');
	var configUpdatePath = "../artifacts/channel/Org1MSPanchors.tx";
	logger.debug('Channel name : ' + channelName);
	logger.debug('configUpdatePath : ' + configUpdatePath);
	await updateAnchorPeers.updateAnchorPeers(channelName, configUpdatePath, username1, orgname1);
	await updateAnchorPeers.updateAnchorPeers(channelName, configUpdatePath, username2, orgname2);

	// Install chaincode on target peers
	logger.debug('==================== INSTALL CHAINCODE ==================');
	var chaincodeName = dna.chaincodeName;
	var chaincodePath = "github.com/example_cc/go";
	var chaincodeVersion = 'v0';
	var chaincodeType = 'golang';
	logger.debug('peers : ' + [dna.peer]); // target peers list
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodePath  : ' + chaincodePath);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	logger.debug('chaincodeType  : ' + chaincodeType);
	await install.installChaincode([dna.peer], chaincodeName, chaincodePath, chaincodeVersion, chaincodeType, username1, orgname1)
	logger.debug('peers : ' + [rna.peer]); // target peers list
	logger.debug('chaincodeName : ' + chaincodeName);
	logger.debug('chaincodePath  : ' + chaincodePath);
	logger.debug('chaincodeVersion  : ' + chaincodeVersion);
	logger.debug('chaincodeType  : ' + chaincodeType);
	await install.installChaincode([rna.peer], chaincodeName, chaincodePath, chaincodeVersion, chaincodeType, username2, orgname2)
	
	// Instantiate chaincode on target peers
	logger.debug('==================== INSTANTIATE CHAINCODE ==================');
	//var fcn = req.body.fcn;
	var peers = ["peer0.org1.example.com","peer1.org1.example.com"];
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