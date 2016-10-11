'use strict';

var shortid = require('shortid');
var Poll = require('../models/polls.js');
var User = require('../models/users.js');

function getBestIp (req) {
	var xffString = req.headers['x-forwarded-for'] || null;
	if (xffString && xffString.length > 0) {
		var ind = xffString.search(',');
		if (ind < 0) {
			return xffString.substring(0, ind);
		} else {
			return xffString;
		}
	} else {
		return req.connection.remoteAddress;
	}
}

function hasVoted (req, doc) {
    var arrName = '';
	var searchTerm = '';
	if (req.user) {
		arrName = 'users';
		searchTerm = req.user.twitter.id;
	} else {
		arrName = 'ips';
		searchTerm = getBestIp(req);
	}
	
	for (var i = 0; i < doc[arrName].length; i++) {
	    if (doc[arrName][i] === searchTerm) {
	        return true;
	    }
	}
	return false;
}

function PollHandler () {
    this.makePoll = function (req, res) {
        var question = req.body.question;
        var choice = req.body.choice;
        var choiceStrings = choice.split('\r\n');
        
        // Check for valid questions and choices.
        if (!question) {
            res.json({ error: 'No question' });
            return;
        }
        if (choiceStrings.length === 0) {
            res.json({ error: 'No choices' });
            return;
        }
        for (var i = 0; i < choiceStrings.length; i++) {
            if (choiceStrings[i].length === 0) {
                res.json({ error: 'Empty choice string'});
                return;
            }
            for (var j = i + 1; j < choiceStrings.length; j++) {
                if (choiceStrings[i] === choiceStrings[j]) {
                    res.json({ error: 'Duplicate choices'});
                    return;
                }
            }
        }
        
        // Build choiceList array for new poll document.
        var choiceList = [];
        for (var i = 0; i < choiceStrings.length; i++) {
            choiceList.push({ 
                choice: choiceStrings[i],
                votes: 0
            });
        }
        
        // Build and save new poll document.
        var newPoll = new Poll();
        
        newPoll._id = shortid.generate();
        newPoll.question = question;
        newPoll.choiceList = choiceList;
        newPoll.users = [];
        newPoll.ips = [];
        
        newPoll.save(function (err, doc) {
            if (err) { throw err; }
            
            // Add poll id to user's pollList.
            User.findOne({ 'twitter.id': req.user.twitter.id }, function (err, user) {
                if (err) { throw err; }
                
                if (!user) {
                    return res.json({ error: 'User not found' });
                } else {
                    user.pollList.push(doc._id);
                    user.markModified('pollList');
                    user.save(function (err) {
                        if (err) { throw err; }
                        
                        res.redirect('/mypolls');
                    });
                }
            });
        });
    };
    
    this.getPoll = function (req, res) {
        // If query 'id' was passed, search for a poll with that id.
        // Otherwise, return all polls.
        if (req.query.id) {
            Poll
                .findOne({ _id: req.query.id }, {})
                .lean()
                .exec( function (err, doc) {
                    if (err) { throw err; }
                    
                    if (!doc) {
                        res.json({});
                    } else {
                        // Append boolean indicating if user owns the poll, then 
                        // send the enriched doc.
                        if (!req.user) {
                            doc.userOwned = 'false';
                            res.json(doc);
                            return;
                        }
                        User
                            .findOne({ 'twitter.id': req.user.twitter.id }, { pollList: 1 })
                            .lean()
                            .exec( function (err, user) {
                                if (err) { throw err; }
                                
                                if (!user) {
                                    res.json({ error: 'User not found' });
                                } else {
                                    for (var i = 0; i < user.pollList.length; i++) {
                                        if (user.pollList[i] === req.query.id) {
                                            doc['userOwned'] = 'true';
                                            res.json(doc);
                                            return;
                                        }
                                    }
                                    doc.userOwned = 'false';
                                    res.json(doc);
                                }
                            });
                    }
                });
        } else {
            var result = [];
            Poll
                .find({}, { _id: 1, question: 1 })
                .cursor()
                .on('data', function(doc){
                    result.push(doc);
                })
                .on('error', function(err){
                    throw err;
                })
                .on('end', function(){
                    res.json(result);
                });
        }
    };
    
    this.getUserPolls = function (req, res) {
        User.findOne(
            { 'twitter.id': req.user.twitter.id }, 
            { pollList: 1 }, 
            function (err, user) {
                if (err) { throw err; }
                
                if (!user) {
                    res.json({ error: 'User not found' });
                } else if (user.pollList.length === 0) {
                    res.json({});
                } else {
                    var result = [];
                    var count = 0;
                    var numCalls = user.pollList.length;
                    for (var i = 0; i < numCalls; i++) {
                        Poll.findOne(
                            { _id: user.pollList[i] }, 
                            { _id: 1, question: 1 },
                            function (err, doc) {
                                count++;
                                if (err) {
                                    result.push({ error: 'findOne error' });
                                } else if (!doc) {
                                    result.push({ error: 'Poll not found' });
                                } else {
                                    result.push(doc);
                                }
                                if (count === numCalls) {
                                    for (var i = 0; i < numCalls; i++) {
                                        if (result[i].error) {
                                            return res.json(result[i]);
                                        }
                                    }
                                    res.json(result);
                                }
                            }
                        );
                    }
                }
            }
        );
    };
    
    this.votePoll = function (req, res) {
        var choice;
        if (req.body.choiceCreate.length > 0) {
            choice = req.body.choiceCreate;
        } else if (req.body.choiceSelect) {
            choice = req.body.choiceSelect;
        } else {
            res.json({ error: 'No choice selected or created' });
        }
        
        Poll
            .findOne(
                { _id: req.body.pollId }, 
                {},
                function (err, doc) {
                    if (err) { throw err; }
                    
                    if (!doc) {
                        res.json({ error: 'Poll not found' });
                    } else if (hasVoted(req, doc)) {
                            res.json({ error: 'User already voted' });
                    } else {
                        // Find choice and increment its vote count, or append 
                        // new choice with a vote count of 1.
                        var newChoice = { choice: choice };
                        
                        var choiceFound = false;
                        for (var i = 0; i < doc.choiceList.length; i++) {
                            if (doc.choiceList[i].choice === choice) {
                                choiceFound = true;
                                newChoice.votes = doc.choiceList[i].votes + 1;
                                doc.choiceList[i] = newChoice;
                                break;
                            }
                        }
                        if (!choiceFound) {
                            newChoice.votes = 1;
                            doc.choiceList.push(newChoice);
                        }
                        
                        // Add user to list of voters.
                        if (req.user) {
                            doc.users.push(req.user.twitter.id);
                            doc.markModified('users');
                        } else {
                        	doc.ips.push(getBestIp(req));
                            doc.markModified('ips');
                        }
                        
                        // Save new doc and end response.
                        doc.markModified('choiceList');
                        doc.save(function (err, doc) {
                            if (err) { throw err; }
                            
                            res.writeHead(301, { Location: '/poll/' + doc._id });
                            res.end();
                        });
                    }
                }
            );
    };
    
    this.deletePoll = function (req, res) {
        if (!req.query.id) {
            res.json({ error: 'No id param in delete request' });
        }
        Poll
            .findById(req.query.id, function (err, doc) {
                if (err) { throw err; }
                
                if (!doc) {
                    res.json({ error: 'Poll not found' });
                } else {
                    User.findById(req.user.id, function (err, user) {
                        if (err) { throw err; }
                        
                        if (!user) {
                            res.json({ error: 'User not found' });
                        } else {
                            var pollFound = false;
                            for (var i = 0; i < user.pollList.length; i++) {
                                if (user.pollList[i] === req.query.id) {
                                    user.pollList.splice(i);
                                    user.markModified('pollList');
                                    pollFound = true;
                                    break;
                                }
                            }
                            if (!pollFound) {
                                res.json({ error: 'Poll not owned by user' });
                            } else {
                                user.save(function (err) {
                                    if (err) { throw err; }
                                    
                                    doc.remove( function (err) {
                                        if (err) { throw err; }
                                        
                                        res.end();
                                    });
                                });
                            }
                        }
                    });
                }
            });
    };
}

module.exports = PollHandler;