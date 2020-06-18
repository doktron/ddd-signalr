"use strict";

var connection = new signalR.HubConnectionBuilder()
	.withUrl("/helpdeskhub")
	.build();

//Disable send button until connection is established
document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMessage", function (user, message) {
	console.log("received message", user, message);
	var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	var encodedMsg = user + " says " + msg;
	var li = document.createElement("li");
	li.textContent = encodedMsg;
	document.getElementById("messagesList").appendChild(li);
});

connection.on("ClientListUpdate",
	function(clients) {
		var clientInput = document.getElementById("clientInput");
		clientInput.options.length = 0;
		for (var i = 0; i < clients.length; i++) {
			clientInput.options[i] = new Option(clients[i], clients[i]);
		}
	});

connection.start().then(function () {
	//document.getElementById("sendButton").disabled = false;
	console.log("connected");
}).catch(function (err) {
	return console.error(err.toString());
});

function sendMessage(event) {
	var user = document.getElementById("userInput").value;
	var message = document.getElementById("messageInput").value;
	connection.invoke("SendMessage", user, message).catch(function (err) {
		return console.error(err.toString());
	});
	event.preventDefault();
}

function sendHelpdeskMessage(event) {
	var clientInput = document.getElementById("clientInput");
	var connectionId = clientInput.options[clientInput.selectedIndex].value;
	var user = document.getElementById("userInput").value;
	var message = document.getElementById("messageInput").value;
	connection.invoke("SendHelpdeskMessage", connectionId, user, message).catch(function (err) {
		return console.error(err.toString());
	});
	event.preventDefault();
}

document.getElementById("registerClientButton").addEventListener("click", function (event) {
	console.log("Register client");
	connection.invoke("RegisterWebClient").then(function() {
		document.getElementById("sendButton").disabled = false;
		document.getElementById("registerClientButton").disabled = true;
		document.getElementById("registerHelpdeskButton").disabled = true;
		document.getElementById("sendButton").addEventListener("click", sendMessage);
		
	});
	event.preventDefault();
});

document.getElementById("registerHelpdeskButton").addEventListener("click", function (event) {
	console.log("Register helpdesk");
	connection.invoke("RegisterHelpdeskClient").then(function () {
		document.getElementById("sendButton").disabled = false;
		document.getElementById("registerClientButton").disabled = true;
		document.getElementById("registerHelpdeskButton").disabled = true;
		document.getElementById("sendButton").addEventListener("click", sendHelpdeskMessage);
		document.getElementById("clientRow").style.display = "block";
	});
	event.preventDefault();
});
