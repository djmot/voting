'use strict';

var path = process.cwd();
var PollHandler = require(path + '/app/controllers/pollHandler.server.js');
var multer = require('multer');
var upload = multer();

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
		}).post(isLoggedIn, upload.none(), function (req, res) {
			pollHandler.makePoll(req, res);
		}).delete(isLoggedIn, function (req, res) {
			pollHandler.deletePoll(req, res);
		});
		
	app.route('/api/poll/user')
		.get(function (req, res) {
			pollHandler.getUserPolls(req, res);
		});
		
	app.route('/api/vote')
		.post(upload.none(), function (req, res) {
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
