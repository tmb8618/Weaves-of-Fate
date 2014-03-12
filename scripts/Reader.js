var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var server = require('../server.js');
var db = server.mongoose;
var server = require('../server.js');
var db = server.mongoose;

var setPasswordFunc = function(password) {
	bcrypt.hashSync(password, 8);
};

var readerSchema = new mongoose.Schema(
	{readerName: {
			type: String,
			unique: true,
		},
		readerPassword: {
			type: String,
			set: setPasswordFunc
		},
		readerNickname: String,
		createdDate: {
			type: Date,
			'default': Date.now
		},
		level: int,
		storyProgress: {}
	});

var ModelReader = mongoose.model('Reader', readerSchema);

readerSchema.methods.readerData = function() {
	return {
		name: this.readerName,
		nickname: this.readerNickname
	};
}