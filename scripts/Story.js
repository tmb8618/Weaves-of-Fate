var mongoose = require('mongoose');
var server = require('../server.js');
var db = server.mongoose;

var StoryModel;
var ChapterModel;

var StorySchema = new mongoose.Schema(
	{
		StoryName: {
			type: String,
			unique: true,
		},
		cover: 'cover.png',
		otherArt: [/*images*/],
		chapters: [{type: Schema.Types.ObjectId, ref: 'Chapter'}],
		createdDate: {
			type: Date,
			'default': Date.now
		},
		level: Number,
	}
);

var ChapterSchema = new mongoose.Schema(
	{
		title: String,
		author: {
			Schema.Types.ObjectId
			ref: 'Reader'
		},
		headerImage: /*image*/,
		text: [String],
		footerImage: /*Image*/
		createdDate: {
			type: Date,
			'default': Date.now
		},
		publishedDate: {
			type: Date,
		},
	}
);

StoryModel = mongoose.model('Stories', StorySchema);
ChapterModel = mongoose.model('Chapters', ChapterSchema);
module.exports.storyModel = StoryModel;
module.exports.storySchema = StorySchema;
module.exports.chapterModel = ChapterModel;
module.exports.chapterSchema = ChapterSchema;

