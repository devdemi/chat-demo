
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = require('mongoose')
  , routes = require('./routes')
  , user = require('./routes/user')
  , session = require('./routes/session')
  , message = require('./routes/message')
  ,	ClientModel = require('./models/client_model').ClientModel
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var colors = require('colors');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

// Basic express server, only for static content
// app.configure(function() {
// 	app.use(express.static(__dirname + '/public'));
// });

// DB Connection for Client list
mongoose.connect('mongodb://localhost/chat-demo');

// Clean previous data
var clients = new ClientModel();
clients.collection.drop();


var server = app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
var io = require('socket.io').listen(server);

// Add listeners to the sockets
io.sockets.on('connection', function(socket) {

	// Handle chat logins
	socket.on('login attempt', function(data) {
		session.login(io, socket, data);
	});

	// handle chat logouts
	socket.on('logout attempt', function(data) {
		session.logout(io, socket, data);
	});

	// Handle messages
	socket.on('message', function(data) {
		message.message(io, socket, data);
	});

	// Handle disconnects
	socket.on('disconnect', function(data) {
		session.disconnect(io, socket, data);
	});
});