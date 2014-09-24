var express = require('express');
var app = express();

//var users = require('./routes/users');

var http = require('http').Server(app);
var io = require('socket.io')(http);

//var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));
//app.use(express.logger('dev'));
//app.use(bodyParser.json());

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.htm');
});

/*app.get('/users', users.findAll);
app.get('/users/:id', users.findById);
app.post('/users', users.addUser);
app.put('/users/:id', users.updateUser);
app.delete('/users/:id', users.deleteUser);
*/



/*
var tester = new Test({
  name: 'ALEXUHNDRRRRR'
})

tester.save(function(err, tester){
  if(err) return console.error(err);

  console.log("saving tester");
})
*/
//console.log(tester.name);

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

http.listen(8080, function(){
  console.log(timeStamp() + ' Server listening on port 8080');
});


function SocketHandler(io)
{
  this.painting = new Painting();
  this.clientCount = 0;
  this.clients = [];
  this.clientList = [];
  this.gotDataURL = false;

  this.io = io;

  this.init();
}

  SocketHandler.prototype.init = function()
  {
    this.setupSocketEvents();
  }

  SocketHandler.prototype.addClient = function(socket)
  {
    this.clientCount++;

    this.clientList.push(socket.id);
    this.clients[socket.id] = socket;
  }

  SocketHandler.prototype.removeClient = function(socket)
  {
    var pos = this.clients.indexOf(socket.id);
    var listPos = this.clientList.indexOf(socket.id);
    this.clients.splice(pos,1);
    this.clientList.splice(listPos,1);
    this.clientCount--;
  }

  SocketHandler.prototype.updateClientCanvas = function(socket)
  {
    if(this.clientCount > 1){
        for(var i = 0; i < this.clientCount; i++){
          if(this.clientList[i] !== socket.id){

            //Här behövs callback som kollar så att vi verkligen fått dataURL, annars
            //kör vi ingen return
            this.clients[this.clientList[i]].emit("Server.RequestDataURL");
            console.log(timeStamp() + " requesting dataURL");
            return;
          }
        }
      }

    else{
      console.log(timeStamp() + " only one client connected, sending backup");
      this.io.sockets.emit("Server.drawBackup", this.painting.getFullPainting());
    }
  }

  SocketHandler.prototype.setupSocketEvents = function()
  {
    var _this = this;

    this.io.sockets.on('connection', function(socket){
      console.log(timeStamp() + ' client connected: '+socket.id);
      _this.addClient(socket);
      _this.updateClientCanvas(socket);

      socket.on('disconnect', function(){
        console.log(timeStamp() + " client disconnected: "+ socket.id);
        _this.removeClient(socket);
      });

      socket.on("Client.drawLine", function(msg){
        //console.log(timeStamp() + " client drawing");
        _this.painting.saveBrushStroke(JSON.parse(msg));
        
        //finns ingen anledning att broadcasta om vi bara har en klient
        if(_this.clientCount > 1)
          socket.broadcast.emit("Server.otherUserDrawingLine", msg);
          
      });

      socket.on("Client.sendDataURL", function(dataURL){
        var dURL = dataURL;
        //skickar till sista klienten i listan, dvs den som senaste connectade
        _this.clients[_this.clientList[_this.clientList.length-1]].emit("Server.sendDataURL", dURL);
      });
      
      socket.on("Client.clearCanvas", function(){

          socket.broadcast.emit("Server.trashPainting");
          _this.painting.removeAll();
          console.log(timeStamp() + " Server har precis get order om att cleara canvas till clienten!");
      }); 

      /*socket.on("Client.manualDisconnect", function(){
        console.log(timeStamp() + " manual disconnect from " + socket.id);
      });*/
    });
  }  

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

/* Utility functions */
function timeStamp()
{
  var d = new Date();

  return d.getFullYear() + "-" + addZero(d.getMonth()+1) + "-" + addZero(d.getDay()) + " " + addZero(d.getHours()) + ":" + addZero(d.getMinutes()) + ":" + addZero(d.getSeconds());
}

function addZero(number)
{
  var nr = (number < 10) ? "0"+number : number;
  return nr;
}

var socketHandler = new SocketHandler(io);