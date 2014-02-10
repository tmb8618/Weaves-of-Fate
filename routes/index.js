
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('helloworld', { title: 'Express' });
};

exports.helloworld = function(req, res){
	res.render('helloworld', { title: 'KAWAII!'});
};

exports.stories = function(req, res){
	res.render('stories', {title: 'Current Weaves'});
};