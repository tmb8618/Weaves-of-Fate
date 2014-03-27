var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var server = require('../server.js');
var db = server.mongoose;

var readerModel;

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

/*ReaderSchema.pre('save', function(next) {
	
	if (this.isModified('password')) {
		return next();
	}

	var salt = bcrypt.genSaltSync(10);
	bcrypt.hashSync(this.password, salt);
	this.password = 
});*/

ReaderSchema.methods.ReaderData = function() {
	return {
		name: this.readerName,
		nickname: this.readerNickname
	};
}

ReaderSchema.methods.validatePassword = function(password) {
	console.log(password);
	console.log(this.password);
	return bcrypt.compareSync(password, this.password);
}

ReaderModel = mongoose.model('Readers', ReaderSchema);
module.exports.readerModel = ReaderModel;
module.exports.readerSchema = ReaderSchema;