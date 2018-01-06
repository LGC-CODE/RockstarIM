var app = angular.module('RockstarIM',['ui.router']);

app.factory('users', ['$http', 'auth', function($http, auth){ //creating service syntax
	var o = { users: [] };

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

app.factory('user-details', ['$http', '$window', function($http, $window){ //creating service syntax
	var v = {};
	
	v.getNotifications = function(){
		
		var token = $window.localStorage['rockstar-token']
		
		if(token){
			
		}
	}
	
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
				_id: payload._id,
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

app.factory('socket', ['$rootScope', '$window', function ($rootScope, $window) {
  var socket = io($window.location.host);
  return socket;
  
}]);

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

app.controller('mainCtrl', [ '$scope', '$stateParams', 'userRetrieve', 'users', 'auth', '$window','socket',
	function($scope, $stateParams, userRetrieve, users, auth, $window, socket){
	$scope.message = [];
	$scope.text = "";
	$scope.guest = auth.currentUser();
	$scope.host = userRetrieve;
	
	$scope.resetNotification = function(){
		//notification($scope.host.displayName, 'reset');
	};
	
	function private(room_id){
		socket.emit('join', {room: room_id, user: $scope.guest.display});
		socket.on(room_id, data => {
			
			$scope.message.unshift({
				text: data.text,					//display text and name
				fromUser: data.from,
				room: data.room
		 	});
			
			// if($scope.host.displayName === $scope.guest.display) {
			// 	notification($scope.host.displayName, 'add');
			// }
			
			$scope.$apply();

		});
	};
	
	private($scope.host._id);
	
	var notification = function(username, type){
		type === 'add' ? 
			socket.emit(username, {type: 'add', user: $scope.host.displayName}) : 
				socket.emit(username, {type: 'reset', user: $scope.host.displayName});
	}
	
	$scope.addMessage = function(){
		if(!$scope.text) { return; }
		socket.emit($scope.host._id, { 
			room: $scope.ident,
			text: $scope.text,
			from: $scope.guest.display
		});

		$scope.text = "";
	};

}]);

app.controller('usersCtrl' , [
	'$scope',
	'users', 
	'auth',
	function($scope, users, auth){
	
	$scope.isLoggedIn =  auth.isLoggedIn;
	$scope.users = users.users;
	
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
			if (isNaN(totalAge)) return;
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

app.controller('navCtrl', ['$scope', 'auth', 'socket', function($scope, auth, socket){
	if(auth.isLoggedIn()){
		// $scope.user = auth.currentUser();
		// socket.io.on($scope.user.display, data => {
		// 	console.log(data.notification, 'notification number');
		// 	$scope.userNotification = data.notification;
		// });
		console.log('user logged in');
	}
}]);