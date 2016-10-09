'use strict';

var shortid = require('shortid');
var Poll = require('../models/polls.js');

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
        
        newPoll.save(function (err, doc) {
            if (err) { throw err; }
            
            res.redirect('/');
        });
    };
    
    this.getPoll = function (req, res) {
        // If query 'id' was passed, search for a poll with that id.
        // Otherwise, return all polls.
        if (req.query.id) {
            Poll.findOne(
                { _id: req.query.id }, 
                {},
                function (err, doc) {
                    if (err) { throw err; }
                    
                    if (!doc) {
                        res.json({});
                    } else {
                        res.json(doc);
                    }
                }
            );
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
}

module.exports = PollHandler;