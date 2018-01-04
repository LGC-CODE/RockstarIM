var io = require("socket.io");

var socketIO = {};

socketIO.run = (server) => {
    return io(server);
};

socketIO.listen = (io) => {
    io.on('connection', (socket) => {
        console.log('user connected');
        socket.on('join', (data) => {
            socket.join(data.room);
            
            io.emit( data.room, {
                room: data.room,
                text: `Welcome, ${data.user}`,
                from: 'RockstarIM'
            } );
            
            socket.on(data.room, msg => {
				io.in(data.room).emit(data.room, {
            		room: msg.room,
            		text: msg.text,
            		from: msg.from
            	});
			});
        })
    })
}

module.exports = socketIO;