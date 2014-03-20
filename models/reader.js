var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var server = require('../server.js');
var db = server.mongoose;

var setPasswordFunc = function(password) {
	bcrypt.hashSync(password, 8);
};

var ReaderSchema = new mongoose.Schema(
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
		level: Number,
		storyProgress: {}
	});

ReaderSchema.methods.readerData = function() {
	return {
		name: this.readerName,
		nickname: this.readerNickname
	};
}

var ModelReader = mongoose.model('Reader', ReaderSchema);
module.exports.readerModel = ModelReader;
module.exports.readerSchema = ReaderSchema;