var dbReader = require('../scripts/Reader.js');
var dbStory = require('../scripts/Story.js');

exports.stories = function(req, res) {

	dbStory.storyModel.find({}, function(error, stories) {
		if (error) {
			res.render('stories', {title: 'Current Weaves', reader: req.session.reader, error: 'Database error. Not your fault. Try again in a minute, or maybe an hour.'});
		}

		var storyTitles = new Array();
		stories.forEach(function(oneStory, index) {
			storyTitles[index] = oneStory.name;
		});

		res.render('stories', {title: 'Current Weaves', reader: req.session.reader, stories: storyTitles});
	});
};

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
						dbStory.chapterModel.find({relatedStory: story.id, canon: true}, function(error, chapters) {
							if (error) {
								return res.render('readstory', {title:'DB_ERROR', reader: req.session.reader, error: 'A database error retrieving the chapter. Not your fault. Try again.'});
							}

							var slimChapters = [{
								chaptNum: -1,
								chaptTitle: ""
							}];

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
					chapterNumInt++;
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

				story.chapters.forEach(function(chapt, index) {
					dbStory.chapterModel.findById(chapt, function(error, oneChapt) {
						if (error) {
							return res.render('stories', {title: 'Current Weaves', reader: req.session.reader, error: 'A database error. Try again. Or try again in an hour or so. Whenever. But whatever it is, its not your fault.'});
						}
						slimChapters[index].chaptNum = oneChapt.chapterNumber;
						slimChapters[index].chaptTitle = oneChapt.title;
					});
				});

				dbStory.chapterModel.findById(story.chapters[0], function(error, firstChapter) {
					if (error) {
						return res.render('stories', {title: 'Current Weaves', reader: req.session.reader, error: 'A database error. Try again. Or try again in an hour or so. Whenever. But whatever it is, its not your fault.'});
					}

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

		dbReader.readerModel.findOne({readerName: req.session.reader.name}, function (error, reader) {
			if (error) {
				return res.render('writestory', {title: 'Create a new Story', reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
			}

			if (reader) {

				var prolougeChapter = new dbStory.chapterModel({title: firstChapterName, canon: true, author: reader.id, text: storyText, chapterNumber: 0});

				prolougeChapter.save(function (error) {
					if (error) {
						console.log(error);
						return res.render('writestory', {title: 'Create a new Story', reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
					}
					var newStory = new dbStory.storyModel({name: storyName, chapters: prolougeChapter.id});

					newStory.save(function(error) {
						if (error) {
							console.log(error);
							return res.render('writestory', {title: 'Create a new Story', reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
						}

						console.log('/read/' + newStory.name);
						return res.redirect('/read/' + newStory.name);
					});
				});
			} else {
				return res.render('writeStory', {title: 'Create a new Story', reader: req.session.reader, error: 'Couldn\'t find the currently signed in (that\'s you). Probably nothing, try again soon. (Unless ur a hacker cheat)', text: storyText});
			}
		});
	});
};

exports.writeChapter = function(req, res) {
	
	dbStory.storyModel.findOne({name: req.params.story}, function(error, story) {
		if (error) {
			return res.render('writestory', {title: 'Write Chapter for ' + req.params.story, reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
		}

		if (!story) {
			return res.render('writestory', {title: 'Write Chapter for ' + req.params.story, reader: req.session.reader, error: 'This story doesn\'t exist. You could write it! Right now!'});
		}

		var currentNumChapters = parseInt(story.chapters.length);
		currentNumChapters++;
		res.render('writechapter', {storyTitle: req.params.story, chapterIndex: currentNumChapters, reader: req.session.reader, storyTitle: req.params.story});
	});
};

exports.submitChapter = function(req, res) {
	var newChapterNumber = req.body.chapterNumber;
	var data = req.body.chapterPane;
	console.log("BOYEEEEEE");
	console.log(data);
	res.render('index', {title: data, reader: req.session.reader});
};

exports.chapterList = function(req, res) {
	var story = req.params.story;
};

exports.chapterSubmissions = function(req, res) {
	var story = req.params.story;
	var chapterNumber = req.params.chapter;
};

exports.readChapter = function(req, res) {
	var story = req.params.story;
	var chapterNumber = req.params.chapter;
	var chapterTitle = req.params.chapterTitle;
};