var dbReader = require('../scripts/Reader.js');
var dbStory = require('../scripts/Story.js');

exports.stories = function(req, res) {

	dbStory.storyModel.find({}, function(error, stories) {
		if (error) {
			res.render('stories', {title: 'Current Weaves', reader: req.session.reader, error: 'Database error. Not your fault. Try again in a minute, or maybe an hour.'});
		}

		var storyTitles = {};
		stories.forEach(function(oneStory, index) {
			storyTitles[index] = oneStory.name;
		});

		res.render('stories', {title: 'Current Weaves', reader: req.session.reader, stories: storyTitles});
	});
};

// REDO THIS WHOLE FUNCTION
exports.readStory = function(req, res) {

	var chapterNumInt;

	if (req.params.chapterNumber) {
		chapterNumInt = parseInt(req.params.chapterNumber);
	} else {
		chapterNumInt = 0;
	}

	//console.log(chapterNumInt);

	dbStory.storyModel.findOne({name: req.params.story}, function (error, story) {
		if (error) {
			console.log('db error, story');
		}

		if (story) {

			dbStory.chapterModel.findOne({relatedStory: story.id, chapterNumber: chapterNumInt, canon: true}, function (error, readingChapter) {
				if (error) {
					console.log('db error, chapter');
				}

				//console.log('readingChapter');
				//console.log(readingChapter);

				if (readingChapter) {
					dbStory.chapterModel.find({relatedStory: story.id, canon: true}, function (error, chapters) {
						if (error) {
							console.log('db error, chapter');
						}

						//console.log('allChapters');
						//console.log(chapters);

						var slimChapters = [{}];

						chapters.forEach(function (oneChapt, a) {
							slimChapters[a].chaptNum = oneChapt.chapterNumber;
							slimChapters[a].chaptTitle = oneChapt.title;
						});

						//console.log('slimChapters');
						//console.log(slimChapters);

						return res.render('readstory', {reader: req.session.reader, storyName: req.params.story, chapterIndex: chapterNumInt, chapterTitle: readingChapter.title, chapterText: readingChapter.text, chapterList: JSON.stringify(slimChapters)});

						//console.log('heres my dumb ass');
					});
				} else {
					return res.redirect('/read/' + req.params.story + '/noncanon/' + chapterNumInt);
				}
			});
		}
	});
};

exports.writeStory = function(req, res) {

	if (req.session.reader) {
		res.render('writestory', {title:'Create a new Story', reader: req.session.reader});
	} else {
		//res.session.redirectedFrom = req.originalUrl;
		//console.log(req.session.redirectedFrom);
		res.redirect('signin');
	}
};

exports.submitStory = function(req, res) {
	var storyName = req.body.storyName;
	var firstChapterName = req.body.firstChapter;
	var storyText = req.body.storyPane;
	storyText = storyText.replace(/\r\n|\n/gm, '');
	//console.log(storyText);

	if (!storyName || !firstChapterName || ! storyText) {
		return res.render('writestory', {title: 'Create a new Story', error: 'Make sure you have a title, a prolouge title and ACTUAL WORDS IN THE BOX'});
	}

	dbStory.storyModel.findOne({name: storyName}, function (error, story) {
		if (error) {
			return res.render('writestory', {title: 'Create a new Story', reader: req.session.reader, error: 'Database error. Not your fault. Try again later.', text: storyText});
		}

		if (story) {
			return res.render('writestory', {title: 'Create a new Story', reader: req.session.reader, error: 'Your story is named the same as another story. Call it something else, or check to make sure you didnt already submit that one.', text: storyText});
		}
	});

	dbReader.readerModel.findOne({readerName: req.session.reader.name}, function (error, reader) {
		if (error) {
			return res.render('writestory', {title: 'Create a new Story', reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
		}

		if (reader) {

			var newStory = new dbStory.storyModel({name: storyName, canonChapters: 1});

			newStory.save(function (error, savedStory) {
				if (error) {
					return res.render('writestory', {title: 'Create a new Story', reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
				}

				var prolougeChapter = new dbStory.chapterModel({title: firstChapterName, relatedStory: savedStory.id, canon: true, author: reader.id, text: storyText, chapterNumber: 0});
				prolougeChapter.save(function (error) {
					if (error) {
						console.log(error);
						return res.render('writestory', {title: 'Create a new Story', reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
					}

					savedStory.chapters.push(prolougeChapter);
					savedStory.save(function (error) {
						if (error) {
							return res.render('writestory', {title: 'Create a new Story', reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
						}

						return res.redirect('/read/' + newStory.name);
					});
				});
			});
		} else {
			return res.render('writeStory', {title: 'Create a new Story', reader: req.session.reader, error: 'Couldn\'t find the currently signed in (that\'s you). Probably nothing, try again soon. (Unless ur a hacker cheat)', text: storyText});
		}
	});
	
};

exports.writeChapter = function(req, res) {
	var newChapterWrite = parseInt(req.params.chapterNumber);

	dbStory.storyModel.findOne({name: req.params.story}, function (error, story) {
		if (error) {
			return res.render('writestory', {title: 'Write Chapter for ' + req.params.story, reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
		}

		if (!story) {
			return res.render('writestory', {title: 'Write Chapter for ' + req.params.story, reader: req.session.reader, error: 'This story doesn\'t exist. You could write it! Right now!'});
		}

		console.log(newChapterWrite);
		console.log(story.canonChapters);

		if (newChapterWrite == story.canonChapters) {
			if (req.session.reader) {
				return res.render('writechapter', {storyTitle: req.params.story, chapterIndex: newChapterWrite, reader: req.session.reader});
			} else {
				/*console.log(req.originalUrl);
				console.log(req.session.redirectedFrom);
				res.session.redirectedFrom = req.originalUrl;
				console.log(req.session.redirectedFrom);*/
				return res.redirect('/signin');
			}
		} else if (newChapterWrite < story.canonChapters) {
			return res.render('writechapter', {title: 'Chapter already written!', storyTitle: req.params.story, chapterIndex: -42, error: 'This chapter has already been written, and canonized!'});
		} else {
			return res.render('writechapter', {title: 'Chapter already written!', storyTitle: req.params.story, chapterIndex: 'infinity', error: 'We\'re not up to this chapter yet!'});
		}
	});
};

exports.submitChapter = function(req, res) {
	var newChapterName = req.body.chapterName;
	var textData = req.body.chapterPane;
	var relatedStory = req.params.story;
	var nextChapterNumber = req.params.chapterNumber;
	textData = textData.replace(/\r\n|\n/gm, '');

	dbStory.storyModel.findOne({name: relatedStory}, function (error, story) {
		if (error) {
			console.log('error find chapt');
			return res.render('writeChapter', {error: 'Database screwed up. Just wait a few minutes, it\'ll be fine. Probably.', reader: req.session.reader});
		}

		if (!story) {
			console.log('story doesnt exist');
			return res.render('writeChapter', {error: 'The story you\'re writing for doesnt exist??', reader: req.session.reader});
		}

		dbReader.readerModel.findOne({readerName: req.session.reader.name}, function (error, reader) {
			if (error) {
				console.log('error find chapt');
				return res.render('writeChapter', {error: 'Database screwed up. Just wait a few minutes, it\'ll be fine. Probably.', reader: req.session.reader});
			}

			if (!reader) {
				console.log('no reader');
				return res.render('writeChapter', {error: 'Uh oh. Database says you don\'t exist. Call help? Or your a mad hacker?', reader: req.session.reader});
			}

			dbStory.chapterModel.findOne({title: newChapterName}, function (error, chapterExists) {
				if (error) {
					console.log('error find chapt');
					return res.render('writeChapter', {error: 'Database screwed up. Just wait a few minutes, it\'ll be fine. Probably.', reader: req.session.reader});
				}

				if (chapterExists) {
					console.log('already here');
					return res.render('writeChapter', {error: 'A chapter with the same name already exists. Give it a different name.', reader: req.session.reader});
				}
			});

			var chaptAsInt = parseInt(nextChapterNumber);

			var anotherChapter = new dbStory.chapterModel({title: newChapterName, canon: false, relatedStory: story.id, author: reader.id, text: textData, chapterNumber: chaptAsInt});

			console.log(anotherChapter);

			anotherChapter.save(function (error) {
				if (error) {
					console.log(error);
					return res.render('writeChapter', {error: 'Database screwed up. Just wait a few minutes, it\'ll be fine. Probably.', reader: req.session.reader});
				}

				story.chapters.push(anotherChapter);
				story.save(function (error) {
					if (error) {
						console.log('error find chapt');
						return res.render('writeChapter', {error: 'Database screwed up. Just wait a few minutes, it\'ll be fine. Probably.', reader: req.session.reader});
					}

					res.redirect('/read/' + relatedStory + '/noncanon/' + nextChapterNumber);
				});
			});
		});
	});

	//res.render('index', {title: data, reader: req.session.reader});
};

exports.chapterSubmissions = function(req, res) {
	var storyName = req.params.story;
	var chaptNum = req.params.chapterNumber;

	dbStory.storyModel.findOne({name: storyName}, function (error, story) {
		dbStory.chapterModel.find({relatedStory: story.id, chapterNumber: chaptNum, canon: false}, function (error, c) {
			if (error) {
				res.render('nonCanon', {title: 'Submissions for Chapter ' + chaptNum, error: 'Database screwed up. Wait a moment, or something else, I dunno. Yell at the admin?', reader: req.session.reader});
			}
			/*console.log('story');
			console.log(story);
			console.log('chapters, non canon');
			console.log(c);
			console.log('story found id');
			console.log(story.id);

			console.log(c);*/

			var chapters = [{}];
			c.forEach(function (chapt, a) {
				chapters[a] = c[a].title;
			});

			console.log(chapters);

			res.render('nonCanon', {title: 'Submissions for Chapter ' + chaptNum, chapterIndex: chaptNum, storyName: story.name, chapterTitles: chapters, reader: req.session.reader});
		});
	});
};

exports.nonCanonChapter = function(req, res) {
	var storyName = req.params.story;
	var chaptNumber = req.params.chapterNumber;
	var chaptTitle = req.params.chapterTitle;

	dbStory.storyModel.findOne({name: storyName}, function (error, story) {
		if (error) {

		}

		if (story) {

			dbStory.chapterModel.findOne({relatedStory: story.id, chapterNumber: parseInt(chaptNumber), title: chaptTitle}, function (error, chapter) {
				if (error) {

				}

				console.log(chapter);

				if (chapter) {
					res.render('readnoncanon', {title: 'noncanon', chapterTitle: chaptTitle, chapterIndex: chaptNumber, chapterText: chapter.text});
				}
			});
		}
	});
};