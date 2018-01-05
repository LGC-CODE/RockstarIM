var io = require("socket.io");
var socketModels = require('./socket.models');

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
            
            socket.on(data.user, function(client){
                if(client.type === 'add'){ 
                    socketModels.getNotifications(function(model){
                        model.find({username: client.user})
                                .exec()
                                    .then(user =>{
                                        user.alert('add', (err, data)=>{
                                            io.emit(client.user, {notification: data.notification});
                                        });
                                    })
                                    .catch(err=>new Error(err));
                    })
                } else {
                    socketModels.getNotifications(function(model){
                        model.find({username: client.user})
                                .exec()
                                    .then(user =>{
                                        user.alert('reset', (err, data)=>{
                                            io.emit(client.user, {notification: data.notification});
                                        });
                                    })
                                    .catch(err=> new Error(err));
                    })
                }
                console.log(client, 'client');
            });
            
            io.emit(data.user, 'hello');
            
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