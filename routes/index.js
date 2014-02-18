
var user;
var storyObject;

/*
 * GET home page.
 */

var server = require('../server.js');
var db = server.mongoose;

/*var Cat = mongoose.model('Cat', { name: String });

var kitty = new Cat({ name: 'Zildjian' });
kitty.save(function (err) {
  if (err) // ...
  console.log('meow');
});*/

exports.index = function(req, res){
	res.render('index', { title: 'Express' });
};

exports.helloworld = function(req, res){
	res.render('helloworld', { title: 'KAWAII!'});
};

exports.stories = function(req, res){
	res.render('stories', {title: 'Current Weaves'});
};

exports.newreader = function(req, res) {
	res.render('newreader', {title: 'New Account Sign Up' });
};

exports.signin = function(req, res) {
	res.render('signin', {title: 'Sign In'});
};

exports.knightquest = function(req, res){
	res.render('readstory', {title: 'Knight Quest'});
};