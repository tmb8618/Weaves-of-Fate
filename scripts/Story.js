var mongoose = require('mongoose');
var server = require('../server.js');
var db = server.mongoose;

var storyModel;

var StorySchema = new mongoose.Schema(
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

StorySchema.methods.Content = function() {
	return {
		name: this.readerName,
		nickname: this.readerNickname
	};
}

ReaderModel = mongoose.model('Readers', StorySchema);
module.exports.readerModel = ReaderModel;
module.exports.readerSchema = StorySchema;