var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.htm');
});

painting = new Painting();

var clients = [];

io.on('connection', function(socket){
  console.log('client connected');
  clients[socket.id] = socket;
  
  console.log(clients.length);

  if(clients.length > 1){
    clients[0].emit("Server.RequestDataURL");
    console.log("requesting dataURL");
    console.log(clients[0].id);
  }

  else
    io.sockets.emit("drawBackup", painting.getFullPainting());

  socket.on('disconnect', function(){
    var pos = clients.indexOf(socket.id);
    clients.splice(pos);
  });

  io.sockets.emit("ClientId", socket.id);

  //console.log(socket.id);


  io.sockets.emit("RequestDataURL");

  socket.on("getDataURL", function(data){
      //console.log("fått data!!!!!!!");
      //console.log(data);
  });

   socket.on("sendDataURL", function(dataurl){
    
    console.log(dataurl);
    
    io.sockets.emit("getDataURLol", dataurl);
    
  });


  

  socket.on("drawLine", function(msg){
    socket.broadcast.emit("otherUserDrawingLine", msg);
    painting.saveBrushStroke(JSON.parse(msg));
  });

 

  /*socket.on("sendPath", function(path){
    console.log(path);
  });*/

  /*socket.on("destroy", function(){
    painting.removeAll();
  });*/

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