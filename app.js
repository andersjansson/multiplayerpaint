var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.htm');
});

painting = new Painting();



/*
*  1. Ny användare ansluter
   2. Kolla om det finns andra användare
    if(yes)
      1. skicka "reguestdataurl" till första i listan av andra användare
      2. klienten svarar med "senddataurl"
      3. servern skickar vidare till nya klienten
    else
      skicka backupen
*
*
*/
var clientCount = 0;

var clients = [];
var clientList = [];

io.on('connection', function(socket){
  console.log('client connected: '+socket.id);
  clientCount++;

  clientList.push(socket.id);
  clients[socket.id] = socket;


  console.log(clientList);
  console.log(clientCount);

  if(clientCount > 1){
    clients[clientList[0]].emit("Server.RequestDataURL");
    console.log("requesting dataURL");
    //console.log(clients.socket.id);
  }

  else
  {
    console.log("only one client connected, sending backup");
    io.sockets.emit("Server.drawBackup", painting.getFullPainting());
  }

  socket.on('disconnect', function(){
    console.log("client disconnected: "+ socket.id);
    var pos = clients.indexOf(socket.id);
    var listPos = clientList.indexOf(socket.id);
    clients.splice(pos,1);
    clientList.splice(listPos,1);
    clientCount--;
  });

  socket.on("Client.drawLine", function(msg){
    socket.broadcast.emit("Server.otherUserDrawingLine", msg);
    painting.saveBrushStroke(JSON.parse(msg));
  });

  socket.on("Client.sendDataURL", function(dataURL){
    
    var bla = dataURL;
    //console.log(bla);
    console.log(typeof bla);
    console.log("got dat URL doe");
    clients[clientList[clientList.length-1]].emit("Server.sendDataURL", bla);

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