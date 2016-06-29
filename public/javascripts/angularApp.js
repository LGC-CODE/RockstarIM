var app = angular.module('RockstarIM',['ui.router']);

app.factory('users', ['$http', 'auth', function($http, auth){ //creating service syntax
	var o = {
		users: [	
			{name: 'Luis Constante', nickname: 'RedVeinz', email: 'luisconstante@yahoo.com', age: 21, pictureUrl: 'http://hostingadvice.digitalbrandsinc.netdna-cdn.com/wp-content/uploads/2015/11/JavaScript-Add-to-Array.png'},
			{name: 'john', nickname: 'johnz', email: 'luisconstante@yahoo.com', age: 24, pictureUrl: 'https://dusyefwqqyfwe.cloudfront.net/uploads/recipe/ingredient/image/906/medium_square_medium_square_medium_square_beef-broth.jpg'},
			{name: 'Lopez', nickname: 'bropui', email: 'luisconstante@yahoo.com', age: 18, pictureUrl: 'http://hostingadvice.digitalbrandsinc.netdna-cdn.com/wp-content/uploads/2015/11/JavaScript-Add-to-Array.png'},
			{name: 'louie', nickname: 'playah', email: 'luisconstante@yahoo.com', age: 20, pictureUrl: 'http://d2ydh70d4b5xgv.cloudfront.net/images/1/7/rorstrand-fokus-sweden-square-serving-bowl-wow-brown-white-yellow-42c18e693607592e593f98f1a1a2ca08.jpg'},
			{name: 'polis', nickname: 'rockstar', email: 'luisconstante@yahoo.com', age: 28, pictureUrl: 'http://hostingadvice.digitalbrandsinc.netdna-cdn.com/wp-content/uploads/2015/11/JavaScript-Add-to-Array.png'},
			{name: 'terra', nickname: 'serios', email: 'luisconstante@yahoo.com', age: 30, pictureUrl: 'http://hostingadvice.digitalbrandsinc.netdna-cdn.com/wp-content/uploads/2015/11/JavaScript-Add-to-Array.png'},
		]
	};

	o.getAllUsers = function(){
		return $http.get('/allUsers').success(function(data){
			angular.copy(data, o.users);
		});
	}

	o.createUser = function(newUser){
		return $http.post('/users', newUser).success(function(data){
			o.users.unshift(data);
		});
	}

	o.get = function(id){
		return $http.get('/allUsers/' + id).then(function(res){
			return res.data;
		});
	}

	return o;

}]);

app.factory('identification', function(){ //creating service syntax
	var z = {
		ident: []
	};

	z.ids = function(id){
		console.log('you just checked for: ', id)
		z.ident.push({
			numId: id
		});
	};

	return z;

});

app.factory('count',['$http','users','auth', function($http, users, auth){ //creating service syntax
	var v = [{count: 0}]

	v.addCount = function(obj){
		return $http.put('/allUsers/' + obj._id + '/notify', obj)
			.success(function(data){
				// obj.notification +=1;
				console.log(data, 'logging data parameter addCount');
			});

		// console.log(obj, 'obj object addcount posting');
	};	

	v.resetCount = function(obj){
		return $http.put('/allUsers/' + obj._id + '/reset', obj)
			.success(function(data){
				// obj.notification +=1;
				console.log(data, 'logging data parameter resetCount');
		});
	};

	v.nfy = function(){
		var usr = users.users
			for (var i = 0; i < usr.length; i++) {
				if(!auth.isLoggedIn()){
					console.log('user is logged off');
				}
				else {
					if(usr[i].username == auth.currentUser().name){
						console.log(usr[i] , 'obj returned notify func');
						return usr[i];
					} else {
						console.log('ERROR');
					}
				} 
			}
	};

	v.keepCount = function(){
			console.log(v.nfy(), 'this is notification property');

			return v.nfy();
	};

	return v;

}]);

app.factory('auth', ['$http', '$window', function($http, $window){
	var auth = {};

	auth.saveToken =  function(token){
		$window.localStorage['rockstar-token'] = token;
	};

	auth.getToken = function(){
		return $window.localStorage['rockstar-token'];

	};

	auth.isLoggedIn = function(){
		var token = auth.getToken();
		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}

	};

	auth.currentUser =  function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			var info = {
				name: payload.username,
				age: payload.age,
				picture: payload.pictureUrl,
				display: payload.displayName,
				notify: payload.notification
			}
			return info;
		}
	};

	auth.register =  function(logUsers){
		return $http.post('/register', logUsers).success(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logIn = function(logUsers){
		return $http.post('/login', logUsers).success(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logOut =  function(){
		$window.localStorage.removeItem('rockstar-token');
	};

	return auth;
}]);

app.factory('socket', function ($rootScope) {
  var socket = io.connect('http://localhost:80');
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

app.config([
		'$stateProvider',
		'$urlRouterProvider',
		function($stateProvider, $urlRouterProvider){

			$stateProvider
				.state('RockstarIM', {
					url: '/RockstarIM/{id}',
					templateUrl: '/RockstarIM.html',
					controller: 'mainCtrl',
					resolve: {
						userRetrieve: ['$stateParams', 'users', function($stateParams, users){
							return users.get($stateParams.id);
						}]
					},
					onEnter: ['$state', 'auth', function($state, auth){
						if(auth.isLoggedIn() == false){
							$state.go('Users');
						}
					}]
				});
			$urlRouterProvider.otherwise('Users');
		}]);

app.config([
		'$stateProvider',
		'$urlRouterProvider',
		function($stateProvider, $urlRouterProvider){

			$stateProvider
				.state('Home', {
					url: '/Home',
					templateUrl: '/home.html',
					controller: 'homeCtrl'
				});
		}]);

app.config([
		'$stateProvider',
		'$urlRouterProvider',
		function($stateProvider, $urlRouterProvider){

			$stateProvider
				.state('Users', {
					url: '/Users',
					templateUrl: '/users.html',
					controller: 'usersCtrl', 
					resolve: {
						userPromise: ['users', function(users){
							return users.getAllUsers();
						}]
					}
				});
		}]);

app.config([
		'$stateProvider',
		'$urlRouterProvider',
		function($stateProvider, $urlRouterProvider){

			$stateProvider
				.state('register', {
					url: '/register',
					templateUrl: '/register.html',
					controller: 'AuthCtrl', 
					onEnter: ['$state', 'auth', function($state, auth){
						if(auth.isLoggedIn()){
							$state.go('Home');
						}
					}]
				});
		}]);

app.config([
		'$stateProvider',
		'$urlRouterProvider',
		function($stateProvider, $urlRouterProvider){

			$stateProvider
				.state('login', {
					url: '/login',
					templateUrl: '/login.html',
					controller: 'AuthCtrl', 
					onEnter: ['$state', 'auth', function($state, auth){
						if(auth.isLoggedIn()){
							$state.go('Home');
						}
					}]
				});
		}]);

app.controller('mainCtrl', [ //RockstarIM
	'$scope',
	'$stateParams',
	'users',
	'auth',
	'userRetrieve',
	'socket',
	'identification',
	'count',
	function($scope, $stateParams, users, auth, userRetrieve, socket, identification, count){
	$scope.message = [];
	$scope.text = "";
	$scope.userReg = users.users;
	$scope.UserLoggedIn = auth.currentDisplay;
	$scope.currentUser = auth.currentUser;
	$scope.user =  userRetrieve;
	$scope.returnUser = $scope.currentUser().display;
	var usr =  users.users;
	console.log($scope.user, 'main ctrl scope user NEW');
	$scope.private = function(id){
		$scope.ident = id;
		socket.emit('subscribe', $scope.ident);
		socket.emit('send message', {			//send data to server
			room: $scope.ident,
			text: 'Welcome to Private Room',
			from: 'RockstarIM'
		});

		identification.ids(id);

	}
	// $scope.nfy = function(){

	// 		for (var i = 0; i < usr.length; i++) {
	// 			if(!auth.isLoggedIn()){
	// 				console.log('user is logged off');
	// 			}
	// 			else {
	// 				if(usr[i].username == auth.currentUser().name){
	// 					console.log(usr[i].age , 'obj returned notify func');
	// 					return usr[i];
	// 				} else {
	// 					console.log('ERROR');
	// 					return 'user not found';
	// 				}
	// 			} 
	// 		}
	// };


	$scope.addMessage = function(){

		if(!$scope.text) { return; }
		socket.emit('send message', { 
			room: $scope.ident,
			text: $scope.text,
			from: $scope.returnUser
		});

		$scope.text = "";
	};

		//receive data from client to server to client
	socket.on('private', function(data){		//update view 
		$scope.message.unshift({
			text: data.text,					//display text and name
			fromUser: data.from,
			room: data.room
	 	});


		count.addCount($scope.user);
	});

}]);

app.controller('usersCtrl' , [
	'$scope',
	'users', 
	'auth',
	function($scope, users, auth){
	$scope.isLoggedIn =  auth.isLoggedIn;
	$scope.userReg = users.users;
	
}]);

app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	'users',
	function($scope, $state, auth, users){
		$scope.user = {};
		var totalAge = parseInt($scope.age);


		$scope.register = function(){
			if (totalAge === NaN) { return; };
			users.createUser({
				name: $scope.name,
				age: totalAge,
				pictureUrl: $scope.url
			});

			auth.register($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('Users');
			});
		};

		$scope.logIn =  function(){
			auth.logIn($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('Users');
			});
		};
}]);

app.controller('NavCtrl', [
	'$scope',
	'auth',
	'users',
	'identification',
	'count',
	function($scope, auth, users, identification, count){
		var usr = users.users;
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
		console.log('count', count[0].count);

		$scope.reset = function(){
			count.resetCount(count.nfy());
		}

		$scope.notify = function(){
			var num = count.keepCount();
			return num;
		}

		$scope.profileId = function(){
			
			for (var i = 0; i < usr.length; i++) {
				if(!auth.isLoggedIn()){
					console.log('user is logged off');
				}
				else {
					if(usr[i].username == auth.currentUser().name){
						console.log(usr[i]._id, 'Success >>> profile id');
						return usr[i]._id;
					} else {
						console.log('ERROR');
					}
				} 
			};
		}

	}]);