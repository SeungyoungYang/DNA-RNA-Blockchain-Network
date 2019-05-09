module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var mysql = require('mysql');
	var multer = require('multer')
	var timeStamp = Date.now();
	var fileIndex = 0;
	var _storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, 'public/product_img/')
		},
		filename: function (req, file, cb) {
			fileIndex += 1;
			cb(null, timeStamp + '_' + fileIndex.toString() + '.jpg');
		}
	});
    var upload = multer({ storage: _storage });

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

	router.get('/registration', function (req, res) {
		res.status(200);

		res.render('product_registration', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'product'
		});
	});

	router.post('/registration', 
				 upload.fields([{ name: 'img1', maxCount: 1 }, 
								{ name: 'img2', maxCount: 1 }, 
								{ name: 'img3', maxCount: 1 }, 
								{ name: 'img4', maxCount: 1 }]), 
	function (req, res) {
		res.status(200);
		var filenum = Object.keys(req.files).length;

		res.render('product_registration', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'product'
		});

		timeStamp = Date.now();
		fileIndex = 0;
	});

	return router;
}