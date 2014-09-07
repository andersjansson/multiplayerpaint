var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.htm');
});

painting = new Painting();

io.on('connection', function(socket){
  console.log('client connected');
  io.sockets.emit("drawFullCanvas", painting.getFullPainting());
  socket.on('chatMessage', function(msg){
    var input = JSON.parse(msg);
    var chatString = input.nick + ": " + input.msg;
    console.log(chatString);
    io.sockets.emit("new", chatString);
  });

  socket.on("drawLine", function(msg){
    socket.broadcast.emit("otherUserDrawingLine", msg);
    painting.saveBrushStroke(JSON.parse(msg));
  });

  socket.on("destroy", function(){
    painting.removeAll();
  });

});

function Painting()
{
  this.paintArray = new Array();
}

  Painting.prototype.saveBrushStroke = function(data)
  {
    this.paintArray.push(data);
  }

  Painting.prototype.getFullPainting = function()
  {
    return JSON.stringify(this.paintArray);
  }

  Painting.prototype.removeAll = function()
  {
    this.paintArray = [];
  }

http.listen(8080, function(){
  console.log('listening on port 8080');
});