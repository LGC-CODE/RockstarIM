window.onload = function(){
	var messages = [];
	var socket = io.connect('http://localhost:80');
	var field = document.getElementbyId('field');
	var sendButton = document.getElementbyId('send');
	var content = document.getElementbyId('content');

	socket.on('message', function(data){
		if(data.message){
			messages.push(data.message);
			var html= '';
			for (var i = 0; i < messages.length; i++) {
				html += messages[i] + '<br />';
			}
			content.innerHTML = html;
		} else {
			console.log('there was a problem ', data);
		}
	});

	sendButton.onclick = function(){
		var text = field.value;
		socket.emit('send', {message : text});
	};
}