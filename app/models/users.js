'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	twitter: { id: String },
    pollList: Object
});

module.exports = mongoose.model('User', User);
