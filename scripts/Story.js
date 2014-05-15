var mongoose = require('mongoose');
var server = require('../server.js');
var db = server.mongoose;

var StoryModel;
var ChapterModel;

var StorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			unique: true,
		},
		cover: String,
		//otherArt: [/*images*/],
		chapters: [{type: mongoose.Schema.Types.ObjectId, ref: 'Chapter'}],
		canonChapters: Number,
		createdDate: {
			type: Date,
			'default': Date.now
		}
	}
);

/* How often is too often to be accessing database? Is there any slowdown? 
	Is it ok to access the database for each chapter read? */
var ChapterSchema = new mongoose.Schema(
	{
		relatedStory: mongoose.Schema.Types.ObjectId,
		canon: Boolean,
		votes: {
			type: Number,
			'default': 0
		},
		title: String,
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Reader'
		},
		chapterNumber: Number,
		//headerImage: /*image*/,
		text: String,
		//footerImage: /*Image*/
		createdDate: {
			type: Date,
			'default': Date.now
		},
		publishedDate: {
			type: Date
		},
	}
);

StoryModel = mongoose.model('Stories', StorySchema);
ChapterModel = mongoose.model('Chapters', ChapterSchema);
module.exports.storyModel = StoryModel;
module.exports.storySchema = StorySchema;
module.exports.chapterModel = ChapterModel;
module.exports.chapterSchema = ChapterSchema;