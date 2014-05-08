exports.Admin = require('./admin.js');
exports.Story = require('./story.js');
exports.Reader =require('./reader.js');

//var user;
//var storyObject;
//var mongoose = require('mongoose');
//var bcrypt = require('bcrypt');
//var server = require('../server.js');
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
	res.render('index', { title: 'Weaves of Fate', reader: req.session.reader});
};

/*exports.helloworld = function(req, res) {
	res.render('helloworld', { title: 'KAWAII!'});
};*/


