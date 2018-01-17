var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
	username: {type: String, lowercase: true, unique: true},
	hash: String,
	salt: String,
	displayName: String,
	age: Number,
	pictureUrl: String,
	notification: { type: Number, default: 0 },
	reset: Boolean
});

UserSchema.methods.setPassword = function(password){
	this.salt = crypto.randomBytes(16).toString('hex');

	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password){
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

	return this.hash === hash;
};

UserSchema.methods.setDisplayName = function(name){
	this.displayName = name;
};

UserSchema.methods.setAge = function(number){
	this.age = number;
};

UserSchema.methods.setUrl = function(picture){
	this.pictureUrl = picture;
};

// UserSchema.methods.deleteUser = function(userId){
// 	UserSchema.deleteOne(userId);
// };

UserSchema.methods.generateJWT =  function(){
	var today =  new Date();
	var exp = new Date(today);
	exp.setDate(today.getDate() + 60);
	console.log('this is age in jwt', this.displayName);
	return jwt.sign({
		_id: this._id,
		username: this.username,
		age: this.age,
		pictureUrl: this.pictureUrl,
		displayName: this.displayName,
		notification: this.notification,
		exp: parseInt(exp.getTime() / 1000)
	}, 'SECRET');
};

UserSchema.methods.alert = function(type, cb){
	if(type === 'add'){
		this.notification += 1;
		this.save(cb);
	} else if(type === 'reset'){
		this.notification = 0;
		this.save(cb);
	} else {
		return this.notification;
	}
}

mongoose.model('LogUser', UserSchema);