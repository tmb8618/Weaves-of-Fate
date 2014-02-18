
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var ipaddr = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/weavesoffate');

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// app.get(this is the part of the url it looks for,
//			this is the function it looks for in the filepath);
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/helloworld', routes.helloworld);
app.get('/stories', routes.stories);
app.get('/stories/knightquest', routes.knightquest);
app.get('/newreader', routes.newreader);
app.get('/signin', routes.signin);
app.get('/readstory/knightquest', routes.knightquest);

//This hooks up the database to any and all scripts.
//I THINK THIS MEANS THE KEYWORD 'mongoose' IS A GLOBAL REFERENCE TO THE DATABASE
exports.mongoose = mongoose;

app.listen(port, ipaddr, function(){
  console.log('Express server listening on port ' + app.get('port'));
});