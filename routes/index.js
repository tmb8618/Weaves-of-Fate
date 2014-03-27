var user;
var storyObject;
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var server = require('../server.js');
var models = require('../scripts/Reader.js');
var db = server.mongoose;

//var stories = require('../public/stories/knightquest.json');
/*
 * GET home page.
 */

exports.index = function(req, res) {
	console.log(req.session);

	res.render('index', { title: 'Weaves of Fate' });
};

exports.helloworld = function(req, res) {
	res.render('helloworld', { title: 'KAWAII!'});
};

exports.stories = function(req, res) {
	res.render('stories', {title: 'Current Weaves'});
};

exports.newReaderPage = function(req, res) {
	res.render('newreader', {title: 'New Account Sign Up' });
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
			return res.render('newreader', {title: 'New Account Sign Up', error: 'Something blew up. Not your things. My things. I\'m cleaning up now, try again'});
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

		res.render('index', {title: 'Weaves of Fate'});

	});
};

exports.signInPage = function(req, res) {
	res.render('signin', {title: 'Sign In'});
};

exports.signIn = function (req, res) {
	var user = req.body.username;
	var pass = req.body.password;

	if (!user || !pass) {
		return res.render('signin', {title: 'Sign In', error: 'Gotta fill out all the fields to sign in.'})
	}
	
	models.readerModel.findOne({readerName: user}, function (error, reader) {
		if (error) {
			res.render('signin', {title: 'Sign In', error: 'Can\'t find that user. Are you sure you that account exists?'});
		}

		if (reader.validatePassword(pass)) {
			req.locals.reader = models.readerData();

			res.render('index', 'Weaves of Fate');
		}
		else {
			res.render('signin', {title: 'SignIn', error: 'Wrong password.'});
		}
	});
};

exports.readStory = function (req, res) {
	switch(req.params.story) {
		case 'knightquest':
			res.render('readstory', {title: req.params.story, story: server.knightquest});
			break;
		default:
			res.render('readstory', {title: 'No Story', error: 'This story doesn\'t exist.'});
	}
};

exports.accountPage = function (req, res) {

	models.readerModel.findOne({readerName: req.params.readerName}, function (error, reader) {
		console.log(reader);
		if (error || !reader) {
			return res.render('useraccount', {error: true});
		}

		res.render('useraccount', {reader: reader});
	});
};

exports.writeChapter = function(req, res) {
	console.log(req);
	res.render('writechapter', {title: "Write Chapter", });
};

exports.submitChapter = function(req, res) {
	var data = req.body.chapterPane;
	res.render('index', {title: data});
}