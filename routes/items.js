module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var mysql = require('mysql');
	var multer = require('multer')
	var timeStamp = Date.now();
	var mysqlDB = require('../config/db');
	var _storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, 'public/product_img/')
		},
		filename: function (req, file, cb) {
			cb(null, timeStamp + '.jpg');
		}
	});
    var upload = multer({ storage: _storage });

	
	router.get('/', function (req, res) {
		res.status(200);
		mysqlDB.query('SELECT * FROM newbabodb.Product;',async function(err, rows, fields ){
			if(!err){
				console.log(rows);
				//console.log(fields);
			} else{
				console.log('query error :'+err);
				//res.send(err);
			}
			await res.render('items', {
				login: req.session.login,
				userid: req.session.userID,
				username: req.session.username,
				authority: req.session.authority,
				page: 'categories',
				items: rows
			});
		})
		
	});

	router.get('/registration', function (req, res) {
		res.status(200);

		res.render('item_registration', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'categories'
		});
	});

	router.post('/registration', upload.single('img1'), function (req, res) {
		res.status(200);

		res.render('items_registration', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'categories'
		});

		timeStamp = Date.now();
	});

	return router;
}