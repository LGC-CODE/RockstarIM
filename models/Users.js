var mongoose = require('mongoose');

var UsersSchema = new mongoose.Schema({
	name: String,
	age: Number,
	pictureUrl: String
});

mongoose.model('Users', UsersSchema); 