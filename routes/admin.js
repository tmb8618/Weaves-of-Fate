var dbReader = require('../scripts/Reader.js');
var dbStory = require('../scripts/Story.js');

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

