var app = require('express');
var http = require('http');
var io = require('socket.io');


var Clients=[];
var UserNames=[];
var UserCount=0;
var previousTokerUser=0;
var httpApp = app();
httpApp.use(app.static(__dirname + "/source/"));
var webServer = http.createServer(httpApp).listen(8080);
console.log("Server Listening at Port 8080");

var socketServer = io.listen(webServer, {"log level":1});

socketServer.on('connection', function(socket){

  	//console.log('New Client Client ID : '+socket.id);
  	
  	socket.on('chat message', function(msg){
  		if (msg=="*#users#") {
  			socketServer.to(socket.id).emit('chat message',Clients.toString());
  		}
  		else if (msg=='*#usernames#') {
  			socketServer.to(socket.id).emit('chat message',UserNames.toString());
  		}
  		else if (msg=='*#usercount#') {
  			socketServer.to(socket.id).emit('chat message',UserCount.toString());
  		}
  		else if (msg=='*#0x000#') {
  			socketServer.to(socket.id).emit('chat message',"Test Successful!!");
  		}
  		else{
  			socketServer.emit('chat message', UserClientMap(socket.id)+" : "+msg);		
  		}
    //console.log(msg);
    //console.log(socket.id);
    //console.log(UserClientMap(socket.id));
    //console.log(UserNames);
    //console.log(UserCount);
  });

   socket.on('newUser', function(msg){
   	var match=false;
   	//check exiting UserNames...
   	for (i = 0; i <= UserCount; i++) { 
    	if (UserNames[i]==msg) {
    		match=true;
    		socketServer.to(socket.id).emit('userApprove','#Match');
    	};
	}

	if (match==false) {
		UserCount+=1;
		console.log(UserCount);
		Clients[UserCount-1]=socket.id;
	   	UserNames[UserCount-1]=msg;
	    socketServer.to(socket.id).emit('userApprove', msg);
	    console.log('New User : '+UserNames[UserCount-1]);	
	    for (x=0;x<UserCount;x++) {
	    	if (Clients[x]!=socket.id) {
	    		 socketServer.to(Clients[x]).emit('newUserAllert',UserNames[UserCount-1]);
	    	}
	    };
	   	
	   	//clear the ActiveUser's list
		socketServer.emit('clearActiveUsers',"clear");
		
		//update the list with new list
		for (x=0;x<UserCount;x++) {
    		socketServer.emit('updateActiveUsers',UserNames[x]);
    	};

    	
	};
   	
  });

	socket.on('disconnect', function(msg){

	for (i = 0; i <= UserCount; i++) { 

    	if (Clients[i]==socket.id) {
    		console.log(UserClientMap(socket.id)+" Left the Chat Room.");
    		socketServer.emit('userLeftAllert',UserClientMap(socket.id));
    		for (j=i; j <= UserCount; j++) {
    			UserNames[j]=UserNames[j+1];
    			Clients[j]=Clients[j+1];
    		};
    		UserCount--;

    		//clear the ActiveUser's list
    		socketServer.emit('clearActiveUsers',"clear");
    		
    		//update the list with new list
    		for (x=0;x<UserCount;x++) {
	    		socketServer.emit('updateActiveUsers',UserNames[x]);
	    	};
    		break;
    	};
	}

   	//UserCount--;
    
  });
});

function UserClientMap(id){
	for (i = 0; i <UserCount; i++) { 
    	if (Clients[i]==id) {
    		return UserNames[i];
    	};
	}
}

