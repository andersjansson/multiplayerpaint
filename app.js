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

var PaintingModel = require('./models/painting');
var router = express.Router();

 
/* API ROUTES */

/*router.use(function(req, res, next) {

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

function Client(socket, name)
{
  this.socket = socket;
  this.id = this.socket.id;
  this.name = (typeof name === 'undefined') ? this.id : name;
}

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
    this.io.sockets.emit("Server.addClient", socket.id);
    var client = new Client(socket);
    this.clients.push(client);
    this.io.sockets.emit("Server.updateClientCount", this.clientCount);
  }

  SocketHandler.prototype.removeClient = function(socket)
  {
    for(var i = 0; i < this.clientCount; i++){
      if(this.clients[i].id == socket.id){
        this.clients.splice(i,1);
        this.clientCount--;
        break;
      }
        
    }

    this.io.sockets.emit("Server.removeClient", socket.id);
  }

  SocketHandler.prototype.handleDataUrlRequest = function(socket)
  {
    var _this = this;
    var reply = false;
    var cancel = false;

    //Om det finns flera klienter, fråga en av de andra efter dataURL, skicka sedan
    if(this.clientCount > 1){
      for(var i = 0; i < this.clientCount; i++){
        if(this.clients[i].id !== socket.id){

          console.log(timeStamp() + " Asking other client for dataURL");
          this.clients[i].socket.emit("Server.requestDataURL", {}, function(error, dataURL){
            if(!cancel){
              if(error){
                console.log(timeStamp() + " Problem receiving dataURL from client");
              }
              else{
                reply = true;
                console.log(timeStamp() + " Got dataURL from client, sending to "+socket.id);
                socket.emit("Server.sendDataURL", dataURL, _this.sendDataURLCallback);
                _this.painting.saveDataURL(dataURL);
              }  
            }
            
          });

          break;
        }
      }

      //Wait one second, if client is too slow in responding, send backup
      setTimeout(function(){
        if(!reply){
          console.log(timeStamp() + " No reply received, or socket too slow in responding");
          cancel = true;
          _this.sendPaintingBackup(socket);
        }
      },2000);
      
        
    }

    else
      this.sendPaintingBackup(socket);

  }
  SocketHandler.prototype.sendPaintingBackup = function(socket)
  {
    if(this.painting.hasDataURL){
      console.log(timeStamp() + " Sending Painting-dataURL");
      socket.emit("Server.sendDataURL", this.painting.dataURL, this.sendDataURLCallback);
    }
    else{
      console.log(timeStamp() + " No dataURL exists, sending Painting-backup");
      socket.emit("Server.drawBackup", this.painting.getFullPainting(), this.sendDataURLCallback);
    }
  }

  SocketHandler.prototype.sendDataURLCallback = function(success)
  {
    if(success){
      this.broadcast.emit("Server.stopLoader");
      this.emit("Server.stopLoader");
    }
      
    else
      console.log(timeStamp() + " Problem sending dataURL to client");
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

      socket.on("Client.requestDataURL", function(dataURL){
        console.log(timeStamp() + " Client requesting dataURL");
        _this.io.emit("Server.startLoader", "Synchronizing... Please wait");
        _this.handleDataUrlRequest(socket);
      });

      socket.on("Client.saveDataURL", function(dataURL){
        console.log(timeStamp() + " Receiving order to save dataURL from client");
        _this.painting.saveDataURLtoMongo(dataURL);
        console.log(timeStamp() + " DataURL just got stored in mongodb!");
      });
      
      socket.on("Client.clearCanvas", function(){
        socket.broadcast.emit("Server.trashPainting");
        _this.painting.removeAll();
        console.log(timeStamp() + " Clearing all canvases");
      });

      /* Chat-related events */

      socket.on("Client.sendChatMessage", function(data){
        var msg = JSON.parse(data);
        for(var prop in msg){
          msg[prop] = validator.escape(msg[prop]);
        }
        socket.broadcast.emit("Server.chatMessage", JSON.stringify(msg));
        
        console.log(timeStamp() + " New chat message from "+msg.sender+": "+msg.text);
      });

      socket.on("Client.requestClientList", function(){
        console.log(timeStamp() + " Client requesting clientList");
        socket.emit("Server.updateClientList", "bajs, bajs, bajs");
      });

      /* Other events */

      socket.on("Client.requestClientCount", function(){
        console.log(timeStamp() + " Client requesting client count");
        socket.emit("Server.updateClientCount", _this.clientCount);
      });
    });
  }  

function Painting(PaintingModel)
{
  this.paintArray = new Array();
  console.log(this.paintArray);
  this.dataURL;
  this.hasDataURL = false;

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
    this.saveDataURLtoMongo(dataURL);
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

var socketHandler = new SocketHandler(io);