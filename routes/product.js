module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var mysql = require('mysql');

	var Database = require("../config/db");

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