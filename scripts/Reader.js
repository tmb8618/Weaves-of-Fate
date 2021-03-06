var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var server = require('../server.js');
var db = server.mongoose;

var ReaderModel;

var setPasswordFunc = function(password) {
	var hashPass = bcrypt.hashSync(password, 10);
	console.log('hashPass:' + hashPass);
	return hashPass;
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
		banned: {
			type: Boolean,
			'default': false
		},
		votedOn: [{type: mongoose.Schema.Types.ObjectId, ref: 'Voted Chapters'}],
		storyProgress: {}
	}
);

ReaderSchema.methods.readerData = function() {
	return {
		name: this.readerName,
		nickname: this.readerNickname,
		level: this.level
	};
}

ReaderSchema.methods.validatePassword = function(password) {
	console.log(this);
	return bcrypt.compareSync(password, this.readerPassword);
}

ReaderModel = mongoose.model('Readers', ReaderSchema);
module.exports.readerModel = ReaderModel;
module.exports.readerSchema = ReaderSchema;