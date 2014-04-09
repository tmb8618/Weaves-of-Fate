var user;
var storyObject;
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var server = require('../server.js');
var models = require('../scripts/Reader.js');
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
	author: dbAuthor.id,

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
	console.log(req.session);
	res.render('stories', {title: 'Current Weaves', reader: req.session.reader});
};

exports.newReaderPage = function(req, res) {
	res.render('newreader', {title: 'New Account Sign Up', reader: req.session.reader});
};

exports.createReader = function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var nickname = req.body.nickname;

	if (!username || !password || !nickname) {
		return res.render('newreader', {title: 'New Account Sign Up', error: 'Can\'t create a new reader. You forgot to fill something in.'});
	}

	models.readerModel.findOne({readerName: username}, function(err, doc) {
		if (err) {
			//RENDER A PAGE...BUT WITH AN ERROR
			return res.render('newreader', {title: 'New Account Sign Up', error: 'Something blew up. Not your things. My things. I\'m cleaning up now, try again.'});
		}

		if (doc) {
			return res.render('newreader', {title: 'New Account Sign Up', error: 'This username already exists! Gotta choose a new one.'});
		}

console.log('Reader password before save:' + password);

		var newReader = new models.readerModel({readerName: username, readerPassword: password, readerNickname: nickname, level: 2});
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
	
	models.readerModel.findOne({readerName: user}, function (error, reader) {
		console.log(reader);

		if (error) {
			res.render('signin', {title: 'Sign In', error: 'Can\'t find that user. Are you sure you that account exists?', reader: req.session.reader});
		}

		if (reader.validatePassword(pass)) {
			
			//req.session.reader = reader.readerData();
			req.session.reader = reader.readerData();

			res.render('index', {title: 'Weaves of Fate', reader: req.session.reader} );
		}
		else {
			res.render('signin', {title: 'SignIn', error: 'Wrong password.', reader: req.session.reader});
		}
	});
};

exports.readStory = function (req, res) {
	switch(req.params.story) {
		case 'knightquest':
			res.render('readstory', {title: req.params.story, story: server.knightquest});
			break;
		default:
			res.render('readstory', {title: 'No Story', error: 'This story doesn\'t exist.', reader: req.session.reader});
	}
};

exports.accountPage = function (req, res) {

	models.readerModel.findOne({readerName: req.params.readerName}, function (error, reader) {
		console.log(reader);
		if (error || !reader) {
			return res.render('useraccount', {error: true, reader: req.session.reader});
		}

		res.render('useraccount', {reader: req.session.reader});
	});
};

exports.writeChapter = function(req, res) {
	console.log(req);
	res.render('writechapter', {title: "Write Chapter", reader: req.session.reader});
};

exports.submitChapter = function(req, res) {
	var data = req.body.chapterPane;
	res.render('index', {title: data, reader: req.session.reader});
}

exports.chapterList = function(req, res) {
	var story = req.params.story;
}

exports.chapterSubmissions = function(req, res) {
	var story = req.params.story;
	var chapterNumber = req.params.chapter;
}

exports.readChapter = function(req, res) {
	var story = req.params.story;
	var chapterNumber = req.params.chapter;
	var chapterTitle = req.params.chapterTitle;
}

exports.changeNickname = function(req, res) {
	var newNickname = req.body.newNick;
	console.log(newNickname);

	models.readerModel.findOne({readerName: req.session.reader.name}, function (error, reader) {

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
}