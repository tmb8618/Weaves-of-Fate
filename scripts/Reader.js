var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var server = require('../server.js');
var db = server.mongoose;

var ReaderModel;

var setPasswordFunc = function(password) {
	var hashPass = bcrypt.hashSync(password, 10);
	console.log(hashPass);
};

var ReaderSchema = new mongoose.Schema(
	{
		readerName: {
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
	}
);

ReaderSchema.methods.readerData = function() {
	return {
		name: this.readerName,
		nickname: this.readerNickname
	};
}

ReaderSchema.methods.validatePassword = function(password) {
	console.log(password);
	console.log(this.readerPassword);
	return bcrypt.compareSync(password, this.readerPassword);
}

ReaderModel = mongoose.model('Readers', ReaderSchema);
module.exports.readerModel = ReaderModel;
module.exports.readerSchema = ReaderSchema;