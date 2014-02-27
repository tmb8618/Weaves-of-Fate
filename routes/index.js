
var user;
var storyObject;
var mongoose = require('mongoose');
/*
 * GET home page.
 */

var setPasswordFunc = function(password) {
	bcrypt.hashSync(password, 8);
};

var readerSchema = new mongoose.Schema(
	{readerName: {
			type: String,
			unique: true,
		},
		readerPassword: {
			type: String,
			set: setPasswordFunc
		},
		readerNickname: String,
		createdDate: {
			type: Date,
			'default': Date.now
		}
	});

var ModelReader = mongoose.model('Reader', readerSchema);

function SignIn() {
	var user = querySelector('#username').value;
	var pass = querySelector('#password').value;

	var reader = ModelReader.find({name: user}, function (error) {
		if (error) {
			res.badReqest()
		}

		if (reader.password != pass) {
			/*Reload login page informing the reader that their password is incorrect.*/
		}
		else { //All is well, now i gotta start thinking about 'sessions.' Is there a bit of 
				//advice you can give me to start me thinking about this? Just guessing, I've
				//heard plenty about cookies, and the like, but as usual, I'm a bit slow to grasp
				//the way I'm supposed to work this out.
		}
	});
}

var server = require('../server.js');
var db = server.mongoose;

exports.index = function(req, res){
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
	var username = req.content.username;
	var password = req.content.password;
	var nickname = req.content.nickname;

	if (!noUsername || !noPassword || !noNickname) {
		return res.badReqest('Can\'t create a new reader. You forgot to fill something in.');
	}

	ModelReader.findOne({readerName: username}, function() {
		if (err) {
			res.err('Something blew up. Not your things. My things. I\'m cleaning up now, try again');
		}

		if (doc) {
			res.conflict('This username already exists! Gotta choose a new one.');
		}

		var newReader = new ModelReader({readerName: username, readerPassword: password, readerNickname: nickname});
		newReader.save(function (err) {
			if (err) {console.log("Failed to Save to Database");}
		});

		res.render('index', {title: 'Weaves of Fate'});

	});
}

exports.signInPage = function(req, res) {
	res.render('signin', {title: 'Sign In'});
};

exports.signIn = function (req, res) {
	var user = req.content.username;
	var pass = req.content.password;
	
	var reader = ModelReader.find({readerName: user}, function (error) {
		if (error) {
			res.badRequest('Can\'t find that user. Are you sure you that account exists?');
		}

		if (bcrypt.compareSync(pass, reader.readerPassword)) {
			res.render('index', 'Weaves of Fate');
		}
		else {
			res.badRequest('Wrong password.');
		}
	});
}

exports.knightquest = function(req, res){
	res.render('readstory', {title: 'Knight Quest'});
};