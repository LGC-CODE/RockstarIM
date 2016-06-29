var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var logUser = mongoose.model('LogUser');

passport.use(new LocalStrategy(
	function(username, password, done){
		logUser.findOne({ username: username }, function(err, logUser){			
			if( err ){ return done(err); }

			if(!logUser){
				return done(null, false, { message: 'Incorrect username.' });
			}

			if(!logUser.validPassword(password)){
				return done(null, false, { message: 'Incorrect password.' });
			}

			return done(null, logUser);
		});
	}
));