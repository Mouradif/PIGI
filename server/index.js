var http = require('http');
var sio = require('socket.io');
var mysql = require('mysql');

var server = http.createServer().listen(8042);
var io = sio.listen(server);

var bdd = mysql.createConnection({
	host	: 'localhost',
	user	: 'root',
	password: 'root',
	database: 'postit'
});

bdd.connect();

io.on('connection', function(s){
	s.ip = s.request.connection.remoteAddress;
  	s.ua = s.request.headers['user-agent'];
	console.log('User connected (IP Adress: '+s.ip+', User-Agent: '+s.ua+')');
	bdd.query("SELECT * FROM postit", function(err, row) {
		if (err) {
			console.log(err);
		}
		else
		{
			s.emit('init', row);
		}
	});
	s.on('save', function(e) {
		bdd.query("INSERT INTO postit SET ?", e, function(err, res){
			if (err) {
				console.log(err);
			}
			else {
				e.id = res.insertId;
				s.broadcast.emit('added', e);
				s.emit('added', e);
				console.log('User '+e.user+' Added a postit : '+e.title);
			}
		});
	});
	s.on('editing', function(el) {
		s.broadcast.emit('editing', el);
		//s.emit('editing', el);
	});
	s.on('saveEdit', function(e) {
		var changes = { 'titre' : e.titre, 'content' : e.content };
		bdd.query("UPDATE postit SET ? WHERE id = "+e.id, changes, function(err, res) {
			
			if (err) {
				console.log(err);
			}
			else {
				s.broadcast.emit('finished_edit', e);
				//s.emit('finished_edit', e);
			}
		});
	});
	s.on('disconnect', function() {
		console.log('user disconnected');
	});
});
