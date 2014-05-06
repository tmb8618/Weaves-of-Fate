
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var bcrypt = require('bcrypt');
var fs = require('fs');
/*var knightQuestStory;

var knightquest = fs.readFileSync('/weavesoffate/public/stories/knightquest.json');
if (knightquest) {
	knightQuestStory = JSON.parse(knightquest);
	console.log(knightQuestStory);
}
else {
	console.log("SHUTTING DOWN CUZ NO KNIGHTQUEST.JSON");
	process.exit(5);
}*/

var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore();

var app = express();
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var ipaddr = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var mongoose = require('mongoose');
var dbConnection = 'mongodb://localhost/weavesoffate';
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
	dbConnection = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
		process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
		process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
		process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
		process.env.OPENSHIFT_APP_NAME;
}

mongoose.connect(dbConnection);

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({
	key: 'reader.sid',
	secret: '1n73n53_R34d1ng_4c710n',
	store: sessionStore
}));
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
//app.get('/helloworld', routes.helloworld);
app.get('/stories', routes.stories);
app.get('/newreader', routes.newReaderPage);
app.get('/signin', routes.signInPage);
app.get('/reader/:readerName', routes.accountPage);
app.get('/writestory', routes.writeStory);
app.get('/write/:story/:chapterNumber', routes.writeChapter);
app.get('/read/:story', routes.readStory);
app.get('/read/:story/', routes.readStory);
app.get('/read/:story/:chapterNumber', routes.readStory);
app.get('/read/:story/:chapterNumber/', routes.readStory);
//app.get('/read/:story/chapters/:chapterNumber/:chapterTitle', routes.readChapter);
app.post('/');
app.post('/submitStory', routes.submitStory);
app.post('/createReader', routes.createReader);
app.post('/readerSignIn', routes.signIn);
app.post('/submitChapter/:story', routes.submitChapter);
app.post('/changeNickname', routes.changeNickname);



//This hooks up the database to any and all scripts.
//I THINK THIS MEANS THE KEYWORD 'mongoose' IS A GLOBAL REFERENCE TO THE DATABASE
exports.mongoose = mongoose;
//exports.knightquest = knightQuestStory;

app.listen(port, ipaddr, function(){
  console.log('Express server listening on port ' + app.get('port'));
});