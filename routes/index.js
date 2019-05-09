module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var mysql = require('mysql');
	
	var Database = require("../config/db");
	var connection = mysql.createConnection({
		host: Database.host,
		port: Database.port,
		user: Database.user,
		password: Database.password,
		database: Database.database
	});

	router.get('/', function (req, res) {
		res.status(200);
		
        res.render('index', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'main'
		});
	});

	router.post('/join', function(req, res) {
        res.status(200);
		
		res.render('index', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'main'
		});
	});
	
	router.post('/login', function (req, res) {
        res.status(200);
		
		var sampleID = "id";
		var samplePW = "pw";
		var sampleName = "yytest";
		var sampleAuth = "N";

		if (sampleID == req.body.id && samplePW == req.body.pw) {
			req.session.userID = sampleID;
			req.session.username = sampleName;
			req.session.authority = sampleAuth;
			req.session.login = 'login';
		}
		else
			return res.send({ msg: "아이디 또는 비밀번호를 확인해주세요!" });
	});

	router.get('/logout', function (req, res) {
		res.status(200);
		
		res.render('index', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'main'
		});
	});

	return router;
}