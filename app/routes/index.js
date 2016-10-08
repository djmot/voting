'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');

module.exports = function (app, passport) {
	
	// Use in API calls; if not logged in, returns JSON of empty object.
	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.json({});
		}
	}

	var clickHandler = new ClickHandler();

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
		.get(isLoggedIn, function (req, res) {
			res.json(req.user);
		});
		
	// TODO: connect to pollHandler.server, which doesn't exist yet,
	// which will handle database access to polls here.
	app.route('/api/poll')
		.get(function (req, res) {
			res.json({'poll stuff': 'goes here'});
		}).post( function (req, res) {
			
		});

	app.route('/auth/twitter')
		.get(passport.authenticate('twitter'));

	app.route('/auth/twitter/callback')
		.get(passport.authenticate('twitter', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
};
