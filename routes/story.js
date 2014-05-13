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
exports.readStory = function (req, res) {

	var chapterNumInt = parseInt(req.params.chapterNumber);

	dbStory.storyModel.findOne({name: req.params.story}, function (error, story) {
		if (error) {
			return res.render('stories', {title: 'Current Weaves', reader: req.session.reader, error: 'A database error. Try again. Or try again in an hour or so. Whenever. But whatever it is, its not your fault.'});
		}

		if (story) {
			if (req.params.chapterNumber) {

				console.log(story.chapters.length + ', ' + chapterNumInt);

				if (req.params.chapter < story.chapters.length)	{
						dbStory.chapterModel.find({relatedStory: story.id, canon: true}, function (error, chapters) {
							if (error) {
								return res.render('readstory', {title:'DB_ERROR', reader: req.session.reader, error: 'A database error retrieving the chapter. Not your fault. Try again.'});
							}

							var slimChapters = [{
								chaptNum: -1,
								chaptTitle: ""
							}];

							console.log(chapters);

							chapters.forEach(function(chapt, index) {
								dbStory.chapterModel.findById(chapt, function(error, oneChapt) {
									if (error) {
										return res.render('stories', {title: 'Current Weaves', reader: req.session.reader, error: 'A database error. Try again. Or try again in an hour or so. Whenever. But whatever it is, its not your fault.'});
									}
									slimChapters[index].chaptNum = oneChapt.chapterNumber;
									slimChapters[index].chaptTitle = oneChapt.title;
								});
							});

							return res.render('readstory',
							{
								storyName: story.name,
								reader: req.session.reader,
								chapterIndex: chapters[req.params.chapter].chapterNumber,
								chapterTitle: chapters[req.params.chapter].title,
								chapterText: chapters[req.params.chapter].text,
								chapterList: JSON.stringify(slimChapters)
							});
						});
				} else if (chapterNumInt == story.chapters.length) {
					res.redirect('/write/' + req.params.story + '/' + chapterNumInt);
				} else  {
					return res.render('readstory',
					{
						title: story.name,
						reader: req.session.reader,
						error: 'It\'s a secret! ;)'
					});
				}
			} else {
				var slimChapters = [{
					chaptNum: -1,
					chaptTitle: ""
				}];

				dbStory.chapterModel.find({relatedStory: story.id, canon: true}, function (error, chapters) {

					console.log(chapters);

					story.chapters.forEach(function(chapt, index) {
						dbStory.chapterModel.findById(chapt, function (error, oneChapt) {
							if (error) {
								return res.render('stories', {title: 'Current Weaves', reader: req.session.reader, error: 'A database error. Try again. Or try again in an hour or so. Whenever. But whatever it is, its not your fault.'});
							}
							slimChapters[index].chaptNum = oneChapt.chapterNumber;
							slimChapters[index].chaptTitle = oneChapt.title;
						});
					});

					dbStory.chapterModel.findById(story.chapters[0], function (error, firstChapter) {
						if (error) {
							return res.render('stories', {title: 'Current Weaves', reader: req.session.reader, error: 'A database error. Try again. Or try again in an hour or so. Whenever. But whatever it is, its not your fault.'});
						}

						console.log(firstChapter);

						return res.render('readstory',
						{
							storyName: story.name,
							reader: req.session.reader,
							chapterIndex: firstChapter.chapterNumber,
							chapterTitle: firstChapter.title,
							chapterText: firstChapter.text,
							chapterList: JSON.stringify(slimChapters)
						});
					});
				});

				
			}
		}
	});

	//res.render('readstory', {title: 'No Story', error: 'This story doesn\'t exist.', reader: req.session.reader});
};

exports.writeStory = function(req, res) {
	res.render('writestory', {title:'Create a new Story', reader: req.session.reader});
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

			var newStory = new dbStory.storyModel({name: storyName});

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


			/*var prolougeChapter = new dbStory.chapterModel({title: firstChapterName, canon: true, author: reader.id, text: storyText, chapterNumber: 0});

			prolougeChapter.save(function (error) {
				if (error) {
					console.log(error);
					return res.render('writestory', {title: 'Create a new Story', reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
				}
				var newStory = new dbStory.storyModel({name: storyName, chapters: prolougeChapter.id});

				newStory.save(function (error) {
					if (error) {
						console.log(error);
						return res.render('writestory', {title: 'Create a new Story', reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
					}

					console.log('/read/' + newStory.name);
					return res.redirect('/read/' + newStory.name);
				});
			});*/
		} else {
			return res.render('writeStory', {title: 'Create a new Story', reader: req.session.reader, error: 'Couldn\'t find the currently signed in (that\'s you). Probably nothing, try again soon. (Unless ur a hacker cheat)', text: storyText});
		}
	});
	
};

exports.writeChapter = function(req, res) {
	
	dbStory.storyModel.findOne({name: req.params.story}, function (error, story) {
		if (error) {
			return res.render('writestory', {title: 'Write Chapter for ' + req.params.story, reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
		}

		if (!story) {
			return res.render('writestory', {title: 'Write Chapter for ' + req.params.story, reader: req.session.reader, error: 'This story doesn\'t exist. You could write it! Right now!'});
		}

		var currentNumChapters = parseInt(story.chapters.length);
		res.render('writechapter', {storyTitle: req.params.story, chapterIndex: currentNumChapters, reader: req.session.reader, storyTitle: req.params.story});
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

				/*dbStory.storyModel.findByIdAndUpdate(story.id, {$inc: {chapters: anotherChapter}}, function (error, updatedStory) {
					if (error) {
						console.log('error find chapt');
						return res.render('writeChapter', {error: 'Database screwed up. Just wait a few minutes, it\'ll be fine. Probably.', reader: req.session.reader});
					}

					res.redirect('/read/' + relatedStory + '/noncanon/' + nextChapterNumber);
				});*/

				story.chapters.push(anotherChapter);
				story.save(function (error) {
					if (error) {
						console.log('error find chapt');
						return res.render('writeChapter', {error: 'Database screwed up. Just wait a few minutes, it\'ll be fine. Probably.', reader: req.session.reader});
					}

					res.redirect('/read/' + relatedStory + '/noncanon/' + nextChapterNumber);
				});

				/*story.update({$push: {chapters: anotherChapter.id}}, {multi: false}, function (error, savedStory, numChanged) {
					if (error) {
						console.log('error find chapt');
						return res.render('writeChapter', {error: 'Database screwed up. Just wait a few minutes, it\'ll be fine. Probably.', reader: req.session.reader});
					}

					res.redirect('/read/' + relatedStory + '/noncanon/' + nextChapterNumber);
				});*/
			});
		});
	});

	//res.render('index', {title: data, reader: req.session.reader});
};

exports.chapterSubmissions = function(req, res) {
	var storyName = req.params.story;
	var chaptNum = req.params.chapterNumber;

	dbStory.storyModel.find({name: storyName}, function (error, story) {
		dbStory.chapterModel.find({relatedStory: story.id, canon: false}, function (error, c) {
			if (error) {
				res.render('nonCanon', {title: 'Submissions for Chapter ' + chaptNum, error: 'Database screwed up. Wait a moment, or something else, I dunno. Yell at the admin?', reader: req.session.reader});
			}

			var chapters = {};
			c.forEach(function (chapt, a) {
				chapters[a] = c.chapterName;
			});

			console.log(chapters);

			res.render('nonCanon', {title: 'Submissions for Chapter ' + chaptNum, story: story, chapters:chapters, reader: req.session.reader});
		});
	});

	
};

exports.nonCanonChapter = function(req, res) {
	var story = req.params.story;
	var chaptNumber = req.params.chapter;
	var chaptTitle = req.params.chapterTitle;


};