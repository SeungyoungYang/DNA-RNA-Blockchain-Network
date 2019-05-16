module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var mysql = require('mysql');

	var Database = require("../config/db");
	//var connection = mysql.createConnection(Database);

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

	router.post('/join', function (req, res) {
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

		var queryString = 'select * from Member';
		var flag = false;
		Database.query(queryString, function (err, result) {
			if (err) {
				 console.log(err);
			 }
			else {
				result.forEach(function (item) {
					if (item.id == req.body.id && item.pw == req.body.pw) {

						req.session.userID = item.id;
						req.session.username = item.Member_name;
						req.session.authority = item.admin;
						req.session.login = 'login';
						flag = true;
						req.session.save(() => {
							res.redirect('/');
						});
					}
				})
				if (!flag) return res.send({ msg: "아이디 또는 비밀번호를 확인해주세요!" });
			}
		})
	});

	router.get('/logout', function (req, res) {
		res.status(200);

		req.session.destroy(function (err) {
			if (err) {
				console.log("Session destroy Error");
			} else {
				res.redirect('/');
			}
		})
	});

	return router;
}
