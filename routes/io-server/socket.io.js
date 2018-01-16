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
            console.log(data.room, 'room received');
            
            io.emit( data.room, {
                room: data.room,
                text: `Welcome, ${data.user}`,
                from: 'RockstarIM'
            } );
            
            socket.on(data.user, function(client){
                console.log('notification received ' + client);
                
                if(client.type === 'add'){ 
                    console.log('adding notification', client.type);
                    socketModels.getNotifications(function(model){
                        model.findOne({username: client.user})
                                .exec((err, user)=>{
                                    if(err) new Error(err);
                                    user.notification += 1;
		                            user.save((err, data)=>{
                                        if(err) new Error(err);
                                        console.log('adding notification for user (client.user) ' + client.user);
                                        io.emit(client.user, {notification: data.notification});
                                    });
                                });
                    });
                } else {
                    socketModels.getNotifications(function(model){
                        console.log('resetting notification', client.type);
                        model.findOne({username: client.user})
                                .exec((err, user) =>{
                                    if(err) new Error(err);
                                    user.notification = 0;
		                            user.save((err, data)=>{
                                        if(err) new Error(err);
                                        console.log('resetting for user (client.user) ' + client.user);
                                        io.emit(client.user, {notification: data.notification});
                                    });
                                });
                    });
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