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
            
            res.json(doc);
        });
    };
}

module.exports = PollHandler;