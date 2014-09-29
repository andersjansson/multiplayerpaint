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
  this.chat = new Chat();

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
    this.io.sockets.emit("Server.updateClientCount", this.clientCount);
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
    this.io.sockets.emit("Server.updateClientCount", this.clientCount);
  }

  SocketHandler.prototype.handleDataUrlRequest = function(socket)
  {
    //Om det finns flera klienter, fråga en av de andra efter dataURL, skicka sedan
    if(this.clientCount > 1){
      for(var i = 0; i < this.clientCount; i++){
        if(this.clientList[i] !== socket.id){
          console.log(timeStamp() + " Asking other client for dataURL");
          this.clients[this.clientList[i]].emit("Server.requestDataURL", {}, function(error, dataURL){
            if(error){
              console.log(timeStamp() + " Problem receiving dataURL from client");
            }
            else{
              console.log(timeStamp() + " getting dataURL from client, sending to "+socket.id);
              socket.emit("Server.sendDataURL", dataURL);  
            }
          });

          return;
        }
      }
     }

    else{
      console.log(timeStamp() + " Only one client connected, sending backup");
      if(this.painting.hasDataURL){
        console.log(timeStamp() + " dataURL exists");
        socket.emit("Server.sendDataURL", this.painting.dataURL);
      }
      else{
        console.log(timeStamp() + " no dataURL exists, sending backup")
        socket.emit("Server.drawBackup", this.painting.getFullPainting());
      }
    }
  }

  SocketHandler.prototype.setupSocketEvents = function()
  {
    var _this = this;

    this.io.sockets.on('connection', function(socket){
      console.log(timeStamp() + ' client connected: '+socket.id);
      _this.addClient(socket);

      socket.on('disconnect', function(){
        console.log(timeStamp() + " client disconnected: "+ socket.id);
        _this.removeClient(socket);
      });

      /* Canvas-related events */

      socket.on("Client.drawLine", function(msg){
        _this.painting.saveBrushStroke(msg);
        if(_this.clientCount > 1)
          socket.broadcast.emit("Server.otherUserDrawingLine", msg);
      });

      socket.on("Client.sendDataURL", function(dataURL){
        console.log(timeStamp() + " Receiving dataURL from client");
        _this.painting.saveDataURL(dataURL);
      });

      socket.on("Client.requestDataURL", function(){
        console.log(timeStamp() + " Client requesting dataURL");
        _this.handleDataUrlRequest(socket);
      });
      
      socket.on("Client.clearCanvas", function(){
        socket.broadcast.emit("Server.trashPainting");
        _this.painting.removeAll();
        console.log(timeStamp() + " Clearing all canvases");
      });

      /* Chat-related events */

      socket.on("Client.sendChatMessage", function(data){
        socket.broadcast.emit("Server.chatMessage", data);
        var msg = JSON.parse(data);
        _this.chat.log(msg);
        console.log(timeStamp() + " New chat message from "+socket.id+": "+msg.text);
      });

      /* Other events */

      socket.on("Client.requestClientCount", function(){
        console.log(timeStamp() + " Client requesting client count");
        socket.emit("Server.updateClientCount", _this.clientCount);
      });

      

    });
  }  

function Chat()
{
  this.chatLog = [];
}

  Chat.prototype.log = function(msg)
  {
    this.chatLog.push(msg);
  }

  Chat.prototype.getLog = function()
  {
    return JSON.stringify(this.chatLog);
  }

function Message(type, text)
{
  this.type = type;
  this.text = text;
  this.time = timeStamp();
}

function Painting()
{
  this.paintArray = new Array();
  this.dataURL;
  this.hasDataURL = false;
}

  Painting.prototype.saveDataURL = function(dataURL)
  {
    console.log(timeStamp() + " Saving dataURL");
    this.dataURL = dataURL;
    this.hasDataURL = true;
  }

  Painting.prototype.saveBrushStroke = function(data)
  {
    this.paintArray.push(JSON.parse(data));
  }

  Painting.prototype.getFullPainting = function()
  {
    return JSON.stringify(this.paintArray);
  }

  Painting.prototype.removeAll = function()
  {
    this.paintArray = [];
    this.dataURL = null;
  }

/* Utility functions */
function timeStamp()
{
  var d = new Date();

  return d.getFullYear() 
  + "-" + addZero(d.getMonth()+1) 
  + "-" + addZero(d.getDay()) 
  + " " + addZero(d.getHours()) 
  + ":" + addZero(d.getMinutes()) 
  + ":" + addZero(d.getSeconds());
}

function addZero(number)
{
  var nr = (number < 10) ? "0"+number : number;
  return nr;
}

var socketHandler = new SocketHandler(io);