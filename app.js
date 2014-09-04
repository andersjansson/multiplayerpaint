var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.htm');
});

io.on('connection', function(socket){
  console.log('client connected');

  socket.on('chatMessage', function(msg){
    var input = JSON.parse(msg);
    var chatString = input.nick + ": " + input.msg;
    console.log(chatString);
    io.sockets.emit("new", chatString);
  });

  socket.on("draw", function(msg){
    socket.broadcast.emit("otherUserDrawing", msg);
    console.log(JSON.parse(msg));
  });

});



http.listen(8080, function(){
  console.log('listening on port 8080');
});