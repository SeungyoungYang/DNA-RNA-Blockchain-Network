module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
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
		mysqlDB.query('SELECT * FROM newbabodb.Product;', function(err, rows, fields ){
			if(err){
				console.log('query error :'+err);
			}
			res.render('items', {
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

	var readDB = function(query){
		return new Promise(function(resolve, reject){
			mysqlDB.query(query,  function(err, rows, fields ){
				var pd_id= rows.length+1;
				resolve(pd_id);
			});
		})
	}
	router.post('/registration', upload.single('img1'),  async function (req, res) {
		var pd_name = req.body['product_name'];
		var pd_price = req.body['price'];
		var pd_content = req.body['content'];
		var seller = req.session.userID;
		var timeStamp = Date.now();
		var pd_img = '/product_img/'+req.file.filename;
		var pd_id = await readDB('SELECT * FROM newbabodb.Product;');
		console.log(req.file);
		mysqlDB.query('insert into newbabodb.Product value(?,?,?,?,?,?,?)',[pd_id,pd_img,seller,pd_price,pd_name,pd_content,timeStamp],function(err,rows,field){
			console.log(rows);
		})
		res.redirect('/items');
	});

	return router;
}