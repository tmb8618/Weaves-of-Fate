var user;
var storyObject;
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var server = require('../server.js');
var dbReader = require('../scripts/Reader.js');
var dbStory = require('../scripts/Story.js');
//var storyDB = require('../scripts/Story.js');
var db = server.mongoose;

//var stories = require('../public/stories/knightquest.json');
/*
 * GET home page.
 */

/*var author = req.session.reader;
var dbAuthor = find with database call;

var chap = storyDB.chapterModel({
	title: 'A Rainy Morning',
	author: dbAuthor.id
});

chap.save(function(err) {

});*/

exports.index = function(req, res) {
	console.log(req.session.reader);

	res.render('index', { title: 'Weaves of Fate', reader: req.session.reader});
};

exports.helloworld = function(req, res) {
	res.render('helloworld', { title: 'KAWAII!'});
};

exports.stories = function(req, res) {
	//console.log(req.session);

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

exports.newReaderPage = function(req, res) {
	res.render('newreader', {title: 'New Account Sign Up', reader: req.session.reader});
};

exports.createReader = function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var nickname = req.body.nickname;

	if (!username || !password || !nickname) {
		return res.render('newreader', {title: 'New Account Sign Up', reader: req.session.reader, error: 'Can\'t create a new reader. You forgot to fill something in.'});
	}

	dbReader.readerModel.findOne({readerName: username}, function(err, doc) {
		if (err) {
			//RENDER A PAGE...BUT WITH AN ERROR
			return res.render('newreader', {title: 'New Account Sign Up', reader: req.session.reader, error: 'Something blew up. Not your things. My things. I\'m cleaning up now, try again.'});
		}

		if (doc) {
			return res.render('newreader', {title: 'New Account Sign Up', reader: req.session.reader, error: 'This username already exists! Gotta choose a new one.'});
		}

		var newReader = new dbReader.readerModel({readerName: username, readerPassword: password, readerNickname: nickname, level: 2});
		newReader.save(function (err) {
			if (err) {
				console.log(err);
				return;
			}
		});

		res.render('index', {title: 'Weaves of Fate', reader: req.session.reader});

	});
};

exports.signInPage = function(req, res) {
	res.render('signin', {title: 'Sign In', reader: req.session.reader});
};

exports.signIn = function (req, res) {
	var user = req.body.username;
	var pass = req.body.password;

	if (!user || !pass) {
		return res.render('signin', {title: 'Sign In', error: 'Gotta fill out all the fields to sign in.', reader: req.session.reader})
	}
	
	dbReader.readerModel.findOne({readerName: user}, function (error, reader) {
		console.log(reader);

		if (error) {
			res.render('signin', {title: 'Sign In', error: 'Can\'t find that user. Are you sure you that account exists?', reader: req.session.reader});
		}

		if (reader.validatePassword(pass)) {
			
			req.session.reader = reader.readerData();

			res.render('index', {title: 'Weaves of Fate', reader: req.session.reader} );
		}
		else {
			res.render('signin', {title: 'SignIn', error: 'Wrong password.', reader: req.session.reader});
		}
	});
};

exports.readStory = function (req, res) {
	dbStory.storyModel.findOne({name: req.params.story}, function (error, story) {
		if (error) {
			return res.render('stories', {title: 'Current Weaves', reader: req.session.reader, error: 'A database error. Try again. Or try again in an hour or so. Whenever. But whatever it is, its not your fault.'});
		}

		if (story) {
			if (req.params.chapter) {
				if (req.params.chapter < story.chapters.length)	{
						dbStory.storyModel.findOne({_id: story.chapters[req.params.chapter]}, function(error, chapter) {
							if (error) {
								return res.render('readstory', {title:'DB_ERROR', reader: req.session.reader, error: 'A database error retrieving the chapter. Not your fault. Try again.'});
							}

							return res.render('readstory',
							{
								title: story.name,
								reader: req.session.reader,
								chapterIndex: chapter.chapterNumber,
								chapterTitle: chapter.title,
								chapterText: chapter.text
							});
						});

				} else {
					return res.render('readstory',
					{
						title: story.name,
						reader: req.session.reader,
						error: 'It\'s a secret! ;)'
					});
				}
			} else {
				//proabably <- DEFINITELY gotta .find chapters[0]...

				dbStory.storyModel.findOne({_id: story.chapters[0]}, function(error, chapter) {
					if (error) {
						return res.render('readstory', {title:'DB_ERROR', reader: req.session.reader, error: 'A database error retrieving the chapter. Not your fault. Try again.'});
					}

					return res.render('readstory',
						{
							title: story.name,
							reader: req.session.reader,
							chapterTitle: chapter.title,
							chapterText: chapter.text
						});
				});

				
			}
		}
	});

	//res.render('readstory', {title: 'No Story', error: 'This story doesn\'t exist.', reader: req.session.reader});
};

exports.accountPage = function (req, res) {

	dbReader.readerModel.findOne({readerName: req.params.readerName}, function (error, reader) {
		console.log(reader);
		if (error || !reader) {
			return res.render('useraccount', {error: true, reader: req.session.reader});
		}

		res.render('useraccount', {reader: req.session.reader});
	});
};

exports.writeStory = function(req, res) {
	res.render('writestory', {title:'Create a new Story', reader: req.session.reader});
};

exports.submitStory = function(req, res) {
	var storyName = req.body.storyName;
	var firstChapterName = req.body.firstChapter;
	var storyText = req.body.storyPane;

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
				return res.render('writestory', {title: 'Createa new Story', reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
			}

			if (reader) {
				var prolougeChapter = new dbStory.chapterModel({title: firstChapterName, author: reader.id, text: storyText});

				prolougeChapter.save(function (error) {
					if (error) {
						console.log(error);
						return res.render('writestory', {title: 'Createa new Story', reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
					}
					var newStory = new dbStory.storyModel({name: storyName, chapters: prolougeChapter.id});

					newStory.save(function(error) {
						if (error) {
							console.log(error);
							return res.render('writestory', {title: 'Createa new Story', reader: req.session.reader, error: 'Database error. Probably nothing, try again later.', text: storyText});
						}

						//Can i set params??
						//res.render('readStory', )
						console.log('/read/' + newStory.name);
						return res.redirect('/read/' + newStory.name);
					});
				});
			} else {
				return res.render('writeStory', {title: 'Create a new Story', reader: req.session.reader, error: 'Couldn\'t find the currently signed in (that\'s you). Probably nothing, try again soon. (Unless ur a hacker cheat)', text: storyText});
			}
		});
	});
}

exports.writeChapter = function(req, res) {
	console.log(req);
	res.render('writechapter', {title: 'Write Chapter for ' + req.params.story, reader: req.session.reader});
};

exports.submitChapter = function(req, res) {
	var data = req.body.chapterPane;
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

exports.changeNickname = function(req, res) {
	var newNickname = req.body.newNick;
	console.log(newNickname);

	dbReader.readerModel.findOne({readerName: req.session.reader.name}, function (error, reader) {

		if (error || !reader) {
			return res.render('signin', {error: 'Can\'t find that reader, or something else...'});
		}

		reader.readerNickname = newNickname;

		console.log(reader.readerNickname);

		reader.save(function(err) {
			if (err) {
				return res.render('useraccount', {reader: req.session.reader, error: 'Couldn\'t save the changes. Try again...'})
			}

			req.session.reader = reader.readerData();

			res.render('useraccount', {reader: req.session.reader});
		});
	});
};