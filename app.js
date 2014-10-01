var express = require('express');
var app = express();
var validator = require('validator')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var morgan  = require('morgan');
var bodyParser = require('body-parser');

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

app.use(morgan('dev')); // logga allt i consolen
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // ger oss info från html forms
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var Painting = require('./models/painting');
var router = express.Router();


/* API ROUTES */

router.use(function(req, res, next) {

  console.log('API request just happened.');
  next(); 
});


router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' }); 
});

router.route('/paintings')

 
  .post(function(req, res) {
    
    var painting = new Painting();  
    painting.name = req.body.name;  
    console.log(req.body);
    painting.save(function(err) {
      if (err)
        res.send(err);

      res.json({ message: 'painting created!' });
    });

    
  })

  .get(function(req, res) {
    Painting.find(function(err, paintings) {
      if (err)
        res.send(err);

      res.json(paintings);
    });
  });

router.route('/paintings/:painting_id')

  .get(function(req, res) {
    Painting.findById(req.params.painting_id, function(err, painting) {
      if (err)
        res.send(err);
      res.json(painting);
    });
  })

  .put(function(req, res) {
    Painting.findById(req.params.painting_id, function(err, painting) {

      if (err)
        res.send(err);

      painting.name = req.body.name;
      painting.save(function(err) {
        if (err)
          res.send(err);

        res.json({ message: 'painting updated!' });
      });

    });
  })

  .delete(function(req, res) {
    Painting.remove({
      _id: req.params.painting_id
    }, function(err, painting) {
      if (err)
        res.send(err);

      res.json({ message: 'Successfully deleted' });
    });
  });

app.use('/api', router);

/* SLUTAR API ROUTES YO */

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.htm');
});




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
    var _this = this;

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
              _this.painting.saveDataURL(dataURL);
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