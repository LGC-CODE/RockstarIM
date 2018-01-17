var io = require("socket.io");
var socketModels = require('./socket.models');

var socketIO = {};

socketIO.run = (server) => {
    return io(server);
};

socketIO.listen = (io) => {
    io.on('connection', (socket) => {
        console.log('user connected');
        socket.on('access', (data) => {
            
            socket.on('session', session => {
                
                socket.join(session.room)
                
                io.emit(session.room, {
                    room: session.room,
                    text: `Welcome, ${session.user}`,
                    from: 'RockstarIM'
                });
                
                socket.on(session.room, msg => {
    				io.in(session.room).emit(session.room, {
                		room: msg.room,
                		text: msg.text,
                		from: msg.from
                	});
    			});
                
                console.log(session, 'room received');
            });
            
            socket.on(data.user, function(client){
                //console.log('notification received ' + client);
                
                if(client.type === 'add'){ 
                    //console.log('adding notification', client.type);
                    socketModels.getNotifications(function(model){
                        model.findOne({username: client.user})
                                .exec((err, user)=>{
                                    if(err) new Error(err);
                                    user.notification += 1;
		                            user.save((err, data)=>{
                                        if(err) new Error(err);
                                        //console.log('adding notification for user (client.user) ' + client.user);
                                        io.emit(client.user, {notification: data.notification});
                                    });
                                });
                    });
                } else if(client.type === 'reset'){
                    socketModels.getNotifications(function(model){
                        //console.log('resetting notification', client.type);
                        model.findOne({username: client.user})
                                .exec((err, user) =>{
                                    if(err) new Error(err);
                                    user.notification = 0;
		                            user.save((err, data)=>{
                                        if(err) new Error(err);
                                        //console.log('resetting for user (client.user) ' + client.user);
                                        io.emit(client.user, {notification: data.notification});
                                    });
                                });
                    });
                } else if(client.type === 'get'){
                    socketModels.getNotifications(function(model){
                        //console.log('accessing notification', client.type);
                        model.findOne({username: client.user})
                                .exec((err, user) =>{
                                    if(err) new Error(err);
                                    console.log('accessing for user (client.user) ' + client.user, 'user object: ', user);
                                    io.emit(client.user, {notification: user.notification});
                                });
                    });
                }
                
                console.log(client, 'client');
            });
        })
    })
}

module.exports = socketIO;