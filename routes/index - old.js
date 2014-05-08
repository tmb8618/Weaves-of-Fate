var user;
var storyObject;
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var server = require('../server.js');
var dbReader = require('../scripts/Reader.js');
var dbStory = require('../scripts/Story.js');
//var db = server.mongoose;

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
			return res.render('newreader',{title: 'New Account Sign Up', reader: req.session.reader, error: 'Something blew up. Not your things. My things. I\'m cleaning up now, try again.'});
		} 

		if (doc) {
			return res.render('newreader', {title: 'New Account Sign Up', reader: req.session.reader, error: 'This username already exists! Gotta choose a new one.'});
		}

		console.log(password);

		var newReader = new dbReader.readerModel({readerName: username, readerPassword: password, readerNickname: nickname, level: 2});

		console.log(newReader);

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

exports.changeNickname = function(req, res) {
	var newNickname = req.body.newNick;

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

exports.adminTools = function(req, res) {
	if (req.session.reader) {
		console.log('is signed in');
		if (req.session.reader.level >= 4) {
			console.log('is able');
			return res.render('admintools', {title: 'Administrate Things', reader: req.session.reader});
		}
	}
}

exports.AJAXfindReader = function(req, res) {
	var obj = req.body;

	if (req.session.reader) {
		if (req.session.reader.level >= 4) {
			dbReader.readerModel.findOne({readerName: obj.rName}, function(error, reader) {
				if (error) {
					return res.send({error: 'Database Error! The server is either down or broke. Otherwise, I don\'t know yet.'});
				}

				if (reader) {
					res.send({readerName: reader.readerName, readerNickname: reader.readerNickname, level: reader.level});
				} else {
					return res.send({error: 'Can\'t find this reader! Did you put in their nickname? You need to search by their permanant login name.'});
				}
			});
		}
	}
}

exports.AJAXforceChangeLevel = function(req, res) {
	var readerName = req.params.readerName;
	var newLevel = req.params.newLevel;

	if (req.session.reader) {
		if (req.session.reader.level >= 4) {
			dbReader.rederModel.findOne({readerName: readerName}, function(error, reader) {
				if (error) {
					return res.send({error: 'Database Error! The server is either down or broke. Otherwise, I don\'t know yet.'});
				}

				if (reader) {
					reader.level = parseInt(newLevel);
					return res.send({readerName: reader.readerName, readerLevel: reader.level});
				} else {
					return res.send({error: 'Can\'t find this reader! Did you put in their nickname? You need to search by their permanant login name.'});
				}
			});
		}
	}
}

exports.AJAXforceChangeNickname = function(req, res) {
	var readerName = req.params.readerName;
	var newNickname = req.params.newNickname;

	if (req.session.reader) {
		if (req.session.reader.level >= 4) {
			dbReader.rederModel.findOne({readerName: readerName}, function(error, reader) {
				if (error) {
					return res.send({error: 'Database Error! The server is either down or broke. Otherwise, I don\'t know yet.'});
				}

				if (reader) {
					reader.readerNickname = newNickname;
					return res.send({readerName: reader.readerName, readerNickname: reader.readerNickname});
				} else {
					return res.send({error: 'Can\'t find this reader! Did you put in their nickname? You need to search by their permanant login name.'});
				}
			});
		}
	}
}