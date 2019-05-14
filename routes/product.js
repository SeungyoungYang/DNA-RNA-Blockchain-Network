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

		res.render('product', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'product',
			product_name: 'Smart Phone',
			product_price: '200,000' + '원',
			availability: 'yes'
		});
	});

	return router;
}