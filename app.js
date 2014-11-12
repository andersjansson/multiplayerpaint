
var express       = require('express');
var app           = express();
var http          = require('http').Server(app);
var io            = require('socket.io')(http);
var validator     = require('validator');
var port          = process.env.PORT || 8080;
var mongoose      = require('mongoose');
var passport      = require('passport');
var flash         = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;
var morgan        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var validator     = require('validator');
var session       = require('express-session');

var configDB      = require('./config/database.js');

mongoose.connect(configDB.url); 

require('./config/passport')(passport);

app.use(morgan('dev')); 
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // ger oss info från html forms
app.set('view engine', 'ejs'); // set up ejs for templating
app.use(express.static(__dirname + '/public'));
//passport stuff.
app.use(session({ secret: 'scchhthisisasecretandersdonttellanyone' })); // session secret
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); 
app.use(express.static(__dirname + '/public'));
require('./routes/routes.js')(app, passport); 

var PaintingModel = require('./models/painting');
var RoomModel = require('./models/room');

http.listen(port, function(){
  console.log(timeStamp() + ' Server listening on port '+port);
});

/* 
  1. Kolla om rummet finns
    - om det inte finns, skapa det
    - skapa ny klient i dess RoomHandler
  2. 
  

*/
var roomHandlers = [];
/*
io.sockets.on('connection', function(socket){
  console.log(timeStamp() + ' client connected: '+socket.id);

  socket.on("Client.joinRoom",function(roomId){
    
    if(typeof roomHandlers[roomId] == "undefined"){
      console.log(timeStamp() + " " + "Client "+socket.id+" creates room "+roomId);
      roomHandlers[roomId] = new RoomHandler(io,roomId);
    }
    else
      console.log(timeStamp() + " " + "Client "+socket.id+" joins room "+roomId);
    
    roomHandlers[roomId].addClient(socket);

    console.log(timeStamp() + " ---- Logging in Client.joinRoom ----");
    roomHandlers[roomId].log();
  });

  
});*/

function Room(id)
{
  this.id = id;
  this.dataURLQueue = [];
  this.painting = new Painting(RoomModel);
  this.clientCount = 0;
}

function Client(id, name)
{
  this.id = id;
  this.name = (typeof name === 'undefined') ? this.id.substr(0,7) : name;
}

function RoomHandler(io)
{
  this.rooms = [];
  this.roomId = "blargh";
  this.painting = new Painting(RoomModel);
  this.clientCount = 0;
  this.clients = {};
  this.clientSocket = {};
  this.gotDataURL = false;

  this.dataURLQueue = [];

  this.io = io;

  this.init();
}

  RoomHandler.prototype.init = function()
  {
    this.setupSocketEvents();
  }

  //verkar funka
  RoomHandler.prototype.addClient = function(socket)
  {
    this.clientCount++;
    var client = new Client(socket.id);
    this.clients[socket.id] = client;
    this.clientSocket[socket.id] = socket;
    this.io.to(socket.roomId).emit("Server.updateClientCount", this.clientCount);
    this.io.to(socket.roomId).emit("Server.addClient", JSON.stringify(client));

    this.dataURLQueue.push(socket.id);
  }

  RoomHandler.prototype.clientJoinRoom = function(socket, roomId)
  {
    var s = socket;
    
    s.roomId = roomId;
    s.join(roomId);

    if(typeof this.rooms[roomId] == "undefined"){
      this.rooms[roomId] = new Room(roomId);
    }

    this.rooms[roomId].dataURLQueue.push(socket.id);
    this.rooms[roomId].clientCount++;
  }

  RoomHandler.prototype.clientLeaveRoom = function(socket)
  {
    this.rooms[socket.roomId].dataURLQueue.splice(this.rooms[socket.roomId].dataURLQueue.indexOf(socket.id),1);
    this.rooms[socket.roomId].clientCount--;
  }  

  RoomHandler.prototype.removeClient = function(socket)
  {
    delete this.clients[socket.id];
    delete this.clientSocket[socket.id];
    this.clientCount--;

    this.dataURLQueue.splice(this.dataURLQueue.indexOf(socket.id),1);
    
  }

  RoomHandler.prototype.clientNameChange = function(socket, newName)
  {
    this.clients[socket.id].name = newName;

    return this.clients[socket.id];
  }

  RoomHandler.prototype.handleDataUrlRequest = function(socket)
  {
    var _this = this;
    var reply = false;
    var timeoutIterator = 0;

    //om det finns andra klienter
    if(this.rooms[socket.roomId].dataURLQueue.length > 1)
    {
      for(var i = 0; i < this.rooms[socket.roomId].dataURLQueue.length; i++)
      {
        //starta en setTimeout för varje klient i listan, med 1 sekunds mellanrum
        //i väntetid. Om vi inte får svar från första inom 1 sec körs andra osv.
        if(this.rooms[socket.roomId].dataURLQueue[i] !== socket.id)
        {
          var id = this.rooms[socket.roomId].dataURLQueue[i];

          setTimeout(function(){
            var internalId = _this.rooms[socket.roomId].dataURLQueue[timeoutIterator];
            
            if(!reply)
            {
              console.log(timeStamp() + " Asking "+internalId+" for dataURL");
              _this.clientSocket[internalId].emit("Server.requestDataURL", {}, function(error, dataURL){
                if(error)
                  console.log(timeStamp() + " Problem receiving dataURL from "+socket.id);
                
                else{
                  reply = true;
                  console.log(timeStamp() + " Got dataURL from "+internalId+", sending to "+socket.id);
                  socket.emit("Server.sendDataURL", dataURL, _this.sendDataURLCallback);
                  _this.rooms[socket.roomId].painting.saveDataURL(dataURL);
                  
                  //plocka ut id på den som svarat ur arrayen, lägg sist
                  var placeLast = _this.rooms[socket.roomId].dataURLQueue.splice(_this.rooms[socket.roomId].dataURLQueue.indexOf(internalId),1);
                  _this.rooms[socket.roomId].dataURLQueue.push(placeLast[0]);

                }  
              });
            }
            timeoutIterator++;
          }, (i*1000)+1);  
        }

      }

      //Vänta tills alla blivit frågade, om vi inte fått svar, skicka backup
      setTimeout(function(){
        if(!reply){
          console.log(timeStamp() + " No reply received, or socket(s) too slow in responding");
          _this.sendPaintingBackup(socket);
        }
      },(this.dataURLQueue.length-1)*1000);
    }

    //det finns bara en klient, skicka backup
    else
      this.sendPaintingBackup(socket);
  }

  RoomHandler.prototype.sendPaintingBackup = function(socket)
  {
    if(this.rooms[socket.roomId].painting.hasDataURL){
      console.log(timeStamp() + " Sending Painting-dataURL");
      socket.emit("Server.sendDataURL", this.rooms[socket.roomId].painting.dataURL, this.sendDataURLCallback);
    }
    else{
      console.log(timeStamp() + " No dataURL exists, sending Painting-backup");
      socket.emit("Server.drawBackup", this.rooms[socket.roomId].painting.getFullPainting(), this.sendDataURLCallback);
    }
  }

  RoomHandler.prototype.sendDataURLCallback = function(success)
  {
    if(success){
      this.broadcast.to(this.roomId).emit("Server.stopLoader");
      this.emit("Server.stopLoader");
    }
      
    else
      console.log(timeStamp() + " Problem sending dataURL to client");
  }

  RoomHandler.prototype.setupSocketEvents = function()
  {
    var _this = this;

    this.io.sockets.on('connection', function(socket){

      console.log(timeStamp() + ' client connected: '+socket.id);
      _this.addClient(socket);

      socket.on('disconnect', function(){
        console.log(timeStamp() + " client disconnected: "+ socket.id);
        _this.io.to(socket.roomId).emit("Server.removeClient", socket.id);
        _this.removeClient(socket);
        _this.clientLeaveRoom(socket);
      });

      socket.on("Client.joinRoom",function(roomId){
        _this.clientJoinRoom(socket,roomId);
      });

      /* Canvas-related events */

      socket.on("Client.drawLine", function(msg){
        _this.rooms[socket.roomId].painting.saveBrushStroke(msg);
        if(_this.clientCount > 1)
          socket.broadcast.to(socket.roomId).emit("Server.otherUserDrawingLine", msg);
      });

      socket.on("Client.sendDataURL", function(dataURL){
        console.log(timeStamp() + " Receiving dataURL from client");
        _this.painting.saveDataURL(dataURL);
      });

      socket.on("Client.requestDataURL", function(dataURL){
        console.log(timeStamp() + " Client requesting dataURL");
        _this.io.to(socket.roomId).emit("Server.startLoader", "Synchronizing... Please wait");
        _this.handleDataUrlRequest(socket);
      });

      socket.on("Client.saveDataURL", function(dataURL){
        console.log(timeStamp() + " Receiving order to save dataURL from client");
        _this.painting.saveDataURLtoMongo(dataURL);
        console.log(timeStamp() + " DataURL just got stored in mongodb!");
      });
      
      socket.on("Client.clearCanvas", function(){
        console.log(timeStamp() + " " + socket.id + " clearing all canvases in " + _this.roomId);
        socket.to(socket.roomId).broadcast.emit("Server.trashPainting");
        _this.painting.removeAll();
        _this.io.to(socket.roomId).emit("Server.chatMessage", JSON.stringify({
          type: "status",
          text: " has cleared the canvas.",
          sender: _this.clients[socket.id].name
        }));
      });

      /* Chat-related events */

      socket.on("Client.sendChatMessage", function(data){
        var msg = JSON.parse(data);
        for(var prop in msg){
          msg[prop] = validator.escape(msg[prop]);
        }
        socket.to(_this.roomId).broadcast.emit("Server.chatMessage", JSON.stringify(msg));
        
        console.log(timeStamp() + " New chat message from "+msg.sender+": "+msg.text);
      });

      socket.on("Client.requestClientList", function(){
        console.log(timeStamp() + " Client requesting clientList");
        var clientsInSameRoom = {};

        for(var cId in _this.clientSocket){
          if(_this.clientSocket[cId].roomId === socket.roomId)
            clientsInSameRoom[cId] = _this.clients[cId];
        }
        console.log(clientsInSameRoom);

        _this.io.to(socket.roomId).emit("Server.updateClientList", JSON.stringify(clientsInSameRoom));
      });

      socket.on("Client.changeName", function(newName){
        console.log(timeStamp() + socket.id + " changed name to "+newName);
        var changed = _this.clientNameChange(socket, newName);
        _this.io.to(socket.roomId).emit("Server.updateClient", JSON.stringify(changed));
      });

      /* Other events */

      socket.on("Client.requestClientCount", function(){
        console.log(timeStamp() + " Client requesting client count");
        _this.io.to(socket.roomId).emit("Server.updateClientCount", _this.rooms[socket.roomId].clientCount);
      });

      
    });
  }  

function Painting(roomModel)
{
  this.paintArray = new Array();
  console.log(this.paintArray);
  this.dataURL;
  this.hasDataURL = false;
  this.roomModel = roomModel;
}

  Painting.prototype.roomExists = function(rId)
  {
    this.roomModel.findOne({ roomId: rId}, function (err, doc){
      console.log(doc);
    });

  }

  Painting.prototype.saveDataURLtoMongo = function(dataURL)
  {
    this.dataURL = dataURL;
    var PaintM = new PaintingModel();
    PaintM.name = this.dataURL;
    PaintM.save();
    console.log(timeStamp() + " Saving dataURL in mongoDB");    
  }
  
  Painting.prototype.saveDataURL = function(dataURL)
  {
    console.log(timeStamp() + " Saving dataURL");
    this.dataURL = dataURL;
    this.hasDataURL = true;
  }

  Painting.prototype.saveBrushStroke = function(data)
  {
    if(!this.paintArray)
      this.paintArray = new Array();

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
    this.hasDataURL = false;
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
  return (number < 10) ? "0"+number : number;
}

var roomHandler = new RoomHandler(io);