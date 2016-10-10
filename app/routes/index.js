'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var PollHandler = require(path + '/app/controllers/pollHandler.server.js');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = function (app, passport) {
	
	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	}

	var pollHandler = new PollHandler();

	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});
		
	app.route('/mypolls')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/mypolls.html');
		});
		
	app.route('/newpoll')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/newpoll.html');
		});
		
	app.route('/poll/:id')
		.get(function (req, res) {
			res.sendFile(path + '/public/poll.html');
		});

	app.route('/api/user')
		.get(function (req, res) {
			if (req.isAuthenticated()) {
				res.json(req.user);
			} else {
				res.json({});
			}
		});
	
	app.route('/api/poll')
		.get(function (req, res) {
			pollHandler.getPoll(req, res);
		}).post(isLoggedIn, urlencodedParser, function (req, res) {
			pollHandler.makePoll(req, res);
		});
		
	app.route('/api/vote')
		.post(urlencodedParser, function (req, res) {
			pollHandler.votePoll(req, res);
		});

	app.route('/auth/twitter')
		.get(passport.authenticate('twitter'));

	app.route('/auth/twitter/callback')
		.get(passport.authenticate('twitter', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
};
