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
    this.io.sockets.emit("Server.addClient", socket.id);
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
    this.io.sockets.emit("Server.removeClient", socket.id);
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

      socket.on("Client.requestDataURL", function(dataURL){
        console.log(timeStamp() + " Client requesting dataURL");
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