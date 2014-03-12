
var user;
var storyObject;
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var server = require('../server.js');
var db = server.mongoose;
var server = require('../server.js');
var db = server.mongoose;
var OBJ_Reader = require('../scripts/Reader.js');
/*
 * GET home page.
 */

exports.index = function(req, res){
	console.log(req.session);

	res.render('index', { title: 'Weaves of Fate' });
};

exports.helloworld = function(req, res){
	res.render('helloworld', { title: 'KAWAII!'});
};

exports.stories = function(req, res){


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

	OBJ_Reader.ModelReader.findOne({readerName: username}, function(err, doc) {
		if (err) {
			//RENDER A PAGE...BUT WITH AN ERROR
			return res.render('newreader', {title: 'New Account Sign Up', error: 'Something blew up. Not your things. My things. I\'m cleaning up now, try again'});
		}

		if (doc) {
			return res.render('newreader', {title: 'New Account Sign Up', error: 'This username already exists! Gotta choose a new one.'});
		}

		var newReader = new OBJ_Reader.ModelReader({readerName: username, readerPassword: password, readerNickname: nickname, level: 2});
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
	var user = req.content.username;
	var pass = req.content.password;
	
	var reader = OBJ_Reader.ModelReader.find({readerName: user}, function (error) {
		if (error) {
			res.render('signin', {title: 'Sign In', error: 'Can\'t find that user. Are you sure you that account exists?'});
		}

		if (bcrypt.compareSync(pass, reader.readerPassword)) {
			req.locals.reader = OBJ_Reader.readerData();

			res.render('index', 'Weaves of Fate');
		}
		else {
			res.render('signin', {title: 'SignIn', error: 'Wrong password.'});
		}
	});
};

exports.readStory = function (req, res) {
	$.getJSON("../stories/" + req.params.story + ".json", function(data) {
		res.render('readstory', {title: req.params.story, story: data});
	});
};

exports.accountPage = function (req, res) {
	var reader = OBJ_Reader.ModelReader.find({readerName: req.params.reader}, function (error) {
		if (error) {
			res.render('useraccount', {error: true});
		}

		res.render('useraccount', reader);
	});
};