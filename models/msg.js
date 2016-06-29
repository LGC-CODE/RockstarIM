var express = require('express');
var app = express();
var io = require('socket.io').listen(app.listen(80));

io.sockets.on('connection', function (socket) {
	// socket.emit('message', { 
	// 	message: 'welcome to chatroom',
	// 	from: 'RockstarIM'
	// });
	// socket.on('send', function(data){
	// 	console.log(data);
	// 	io.sockets.emit('message', data);
	// });

	socket.on('send message', function(data){
		console.log('sending room post', data.room, 'message contains: ', data.text);
		io.sockets.in(data.room).emit('private', {
			room: data.room,
			text: data.text,
			from: data.from
		});
	});

	socket.on('subscribe', function(room){
		console.log('joining room: ', room);
		socket.join(room);
	});
}); 

