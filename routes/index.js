
var user;

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.helloworld = function(req, res){
	res.render('helloworld', { title: 'KAWAII!'});
};

exports.stories = function(req, res){
	res.render('stories', {title: 'Current Weaves'});
};

exports.knightquest = function(req, res){
	res.render('stories/knightquest', {title: 'Knight Quest'});
};