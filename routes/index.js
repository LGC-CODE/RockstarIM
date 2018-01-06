var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
var Users = mongoose.model('Users');
var logUser = mongoose.model('LogUser');
var passport = require('passport');
var jwt = require('express-jwt');
var auth =  jwt({ secret: 'SECRET', userProperty: 'payload' });

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/users', function(req, res, next){
	Users.find(function(err, users){
		if(err){ return next(err); }

		res.json(users);

	});
});

router.post('/users', auth, function(req, res, next){
	var user = new Users(req.body);
	var LogUser = new logUser();

	user.name = req.payload.username;

	user.save(function(err, userSave){
		if (err) { return next(err); }

		res.json(userSave);
		return res.json({ token: LogUser.generateJWT() });
	})
});

router.param('id', function(req, res, next, id){
	var query = logUser.findById(id);

	query.exec(function(err, user){
		// if (err) { return next(err);
		if (err) { return next(new Error('Can\'t find user, GOD DAMN IT!!!')); }
		if (!user) { return next(new Error('Can\'t find user, GOD DAMN IT!!!'))};

		req.user = user;
		return next();
	})
});

router.get('/allUsers', function(req, res, next){
	logUser.find(function(err, users){
		
		if(err){ return next(err); }

		res.json(users);

	});
});

router.get('/allUsers/:id', function(req, res){
	res.json(req.user);
});

router.put('/allUsers/:id/get-notification', function(req, res, next){
	res.json(req.user.notification);
});

router.put('/allUsers/:id/reset', function(req, res, next){
	var obj = req.body;
	logUser.findById(obj, function(err, obj1){

		console.log(obj1, 'this is reset');

		obj1.notification = 0;

		obj1.save(function(err){

			if(err) { return next(err); }

			res.send(obj1);
		});	
	});
 console.log(obj);
});

router.post('/register', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({ message: 'Please fill out all fields' });
	}

	var LogUser = new logUser();

	LogUser.username = req.body.username;

	LogUser.setPassword(req.body.password);

	LogUser.setDisplayName(req.body.name);

	LogUser.setAge(req.body.age);

	LogUser.setUrl(req.body.url);

	LogUser.save(function(err){
		if(err){ return next(err); }

		return res.json({ token: LogUser.generateJWT() });

	});
});

router.post('/login', function(req, res, next){
	if(!req.body.username || !req.body.password ){
		console.log('no username or password');
		res.status(400).json({ message: 'Please fill out all fields' });
	}
	passport.authenticate('local', function(err, logUser, info){

		if(err){ return next(err); }

		if(logUser){
			return res.json({ token: logUser.generateJWT() });
		} else {
			return res.status(401).json({ message: 'Username or Password is incorrect'});
		}
	})(req, res, next);
	
});

module.exports = router;
 