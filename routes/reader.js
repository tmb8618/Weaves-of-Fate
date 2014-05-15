var dbReader = require('../scripts/Reader.js');
var dbStory = require('../scripts/Story.js');

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

		//console.log(password);

		var newReader = new dbReader.readerModel({readerName: username, readerPassword: password, readerNickname: nickname, level: 2});

		//console.log(newReader);

		newReader.save(function (err) {
			if (err) {
				console.log(err);
				return;
			}
		});

		req.session.reader = newReader.readerData();

		res.render('index', {title: 'Weaves of Fate', reader: req.session.reader});

	});
};

exports.signInPage = function(req, res) {
	console.log(req.session.redirectedFrom);
	res.render('signin', {title: 'Sign In', reader: req.session.reader});
};

exports.signIn = function (req, res) {
	var user = req.body.username;
	var pass = req.body.password;

	if (!user || !pass) {
		return res.render('signin', {title: 'Sign In', error: 'Gotta fill out all the fields to sign in.', reader: req.session.reader});
	}
	
	dbReader.readerModel.findOne({readerName: user}, function (error, reader) {

		if (error) {
			res.render('signin', {title: 'Sign In', error: 'Can\'t find that user. Are you sure you that account exists?', reader: req.session.reader});
		}

		if (reader.validatePassword(pass)) {
			
			req.session.reader = reader.readerData();

			if(req.session.redirectedFrom) {

			}
			res.redirect('/');
		}
		else {
			res.render('signin', {title: 'SignIn', error: 'Wrong password.', reader: req.session.reader});
		}
	});
};

exports.logOut = function(req, res) {
	req.session.reader = undefined;
	res.redirect('/');
}

exports.accountPage = function (req, res) {

	dbReader.readerModel.findOne({readerName: req.params.readerName}, function (error, reader) {
		console.log(reader);
		if (error || !reader) {
			return res.render('useraccount', {error: true, reader: req.session.reader});
		}

		res.render('useraccount', {reader: req.session.reader});
	});
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