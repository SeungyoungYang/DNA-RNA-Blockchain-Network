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

		var queryString = 'select id from Member';
		var queryString2 = 'insert into Member (id,pw,phone_number,Email,admin,Member_name) VALUES (?,?,?,?,?,?)';
		var flag = true;

		// newid: new_userID,
		// newpw: new_userPW,
		// newpw_c: new_userPW_confirm,
		// newusername: new_userName,
		// newuserPN: new_userPN,
		// newuserEmail: new_userEmail

		if (req.body.newpw != req.body.newpw_c) {
			res.send({ msg: "비밀번호가 서로 같지 않습니다!" });
		}
		else {
			Database.query(queryString, function (err, result) {
				if (err) {
					//console.log(err);
				}
				else {
					result.forEach(function (item) {
						if (item.id == req.body.newid) {
							//중복아뒤 존재
							flag = false;
						}
					});

					if (!flag) {
						res.send({ msg: "이미 존재하는 아이디입니다!" });
					}
					else {
						var params = [req.body.newid, req.body.newpw, req.body.newuserPN, req.body.newuserEmail, 0, req.body.newusername];
						Database.query(queryString2, params, function (err) {
							if (err) {
								//console.log(err);
							}
							else {
								res.send({ msg: "회원가입에 성공하셨습니다!" });
							}
						})
					}
				}
			})
		}
	});
	// console.log(req.body.params);
	// console.log(req.body.new_userID);
	//let error_case;

	// const promise = new Promise((resolve, reject) => {
	// 	if (req.body.new_userPW == req.body.new_userPW_confirm) {
	// 		resolve(true);
	// 	}
	// 	else {
	// 		reject(0);
	// 	}
	// });

	// promise
	// 	.then((message) => {
	// 		console.log(message);
	// 	})
	// 	.catch((error) => {
	// 		if (error == 0) res.send({ msg: "비밀번호가 서로 같지 않습니다!" });
	// 	});

	// 	console.log("asdasd" +error_case);
	// //if (error_case == 0) res.send({ msg: "비밀번호가 서로 같지 않습니다!" });
	// switch (error_case) {
	// 	case 0:
	// 		res.send({ msg: "비밀번호가 서로 같지 않습니다!" });
	// 		break;
	// 	case 1:
	// 		console.log("value 값은 1 ");
	// 		break;
	// 	case 2:
	// 		console.log("value 값은 2 ");
	// 		break;
	// 	case 3:
	// 		console.log("value 값은 3 ");
	// 		break;
	// }


	// var promise2 = new Promise((resolve, reject) => {
	// 	Database.query(queryString, function (err, result) {
	// 		if (err) {
	// 			console.log(err);
	// 		}
	// 		else {
	// 			result.forEach(function (item) {
	// 				if (item.id == req.body.id) {
	// 					//중복아뒤 존재
	// 					flag = false;
	// 					//return reject('fail');
	// 				}
	// 			});
	// 		}
	// 	})
	// 	if (flag == true) return resolve(true);
	// 	else return reject(false);
	// });

	// promise1
	// 	.then((message) => {
	// 		console.log(message);
	// 	})
	// 	.catch((error) => {
	// 		console.log(error);
	// 	});
	// if (flag1) {
	// 	Database.query(queryString, function (err, result) {
	// 		if (err) {
	// 			console.log(err);
	// 		}
	// 		else {
	// 			result.forEach(function (item) {
	// 				if (item.id == req.body.id) {
	// 					flag2 = false; //중복아뒤 존재
	// 				}
	// 				else {
	// 					flag2 = true;
	// 				}
	// 			})
	// 			if (!flag2) return res.send({ Fmsg: "이미 존재하는 아이디입니다!" });
	// 			else {
	// 				params = [req.body.id, req.body.pw, req.body.phone_number, req.body.email, 0, req.body.name];

	// 				Database.query(queryString2, params, function (err) {
	// 					if (err) {
	// 						console.log(err);
	// 					}
	// 					else {
	// 						return res.send({ Smsg: "회원가입에 성공하셨습니다!" });
	// 					}
	// 				})
	// 			}
	// 		}
	// 	})
	// }

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
				if (!flag) res.send({ msg: "아이디 또는 비밀번호를 확인해주세요!" });
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
