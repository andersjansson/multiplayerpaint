
var express  = require('express');
var app      = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var validator = require('validator')
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var LocalStrategy    = require('passport-local').Strategy;
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

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
app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

var PaintingModel = require('./models/painting');

http.listen(8080, function(){
  console.log(timeStamp() + ' Server listening on port 8080');
});


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

/*app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.htm');
});

/*http.listen(8080, function(){
  console.log(timeStamp() + ' Server listening on port 8080');
});
<<<<<<< HEAD
*/
//function Client(socket, name)

function Client(id, name)
{
  this.id = id;
  this.name = (typeof name === 'undefined') ? this.id.substr(0,7) : name;
}

function SocketHandler(io)
{
  this.painting = new Painting();
  this.clientCount = 0;
  this.clients = {};
  this.clientSocket = {};
  this.gotDataURL = false;

  this.dataURLQueue = [];

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
    var client = new Client(socket.id);
    this.clients[socket.id] = client;
    this.clientSocket[socket.id] = socket;
    this.io.sockets.emit("Server.updateClientCount", this.clientCount);
    this.io.sockets.emit("Server.addClient", JSON.stringify(client));

    this.dataURLQueue.push(socket.id);
  }

  SocketHandler.prototype.removeClient = function(socket)
  {
    delete this.clients[socket.id];
    delete this.clientSocket[socket.id];
    this.clientCount--;

    this.dataURLQueue.splice(this.dataURLQueue.indexOf(socket.id),1);
    
  }

  SocketHandler.prototype.clientNameChange = function(socket, newName)
  {
    this.clients[socket.id].name = newName;

    return this.clients[socket.id];
  }

  SocketHandler.prototype.handleDataUrlRequest = function(socket)
  {
    var _this = this;
    var reply = false;
    var timeoutIterator = 0;

    //om det finns andra klienter
    if(this.dataURLQueue.length > 1)
    {
      for(var i = 0; i < this.dataURLQueue.length; i++)
      {
        //starta en setTimeout för varje klient i listan, med 1 sekunds mellanrum
        //i väntetid. Om vi inte får svar från första inom 1 sec körs andra osv.
        if(this.dataURLQueue[i] !== socket.id)
        {
          var id = this.dataURLQueue[i];

          setTimeout(function(){
            var internalId = _this.dataURLQueue[timeoutIterator];
            
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
                  _this.painting.saveDataURL(dataURL);
                  
                  //plocka ut id på den som svarat ur arrayen, lägg sist
                  var placeLast = _this.dataURLQueue.splice(_this.dataURLQueue.indexOf(internalId),1);
                  _this.dataURLQueue.push(placeLast[0]);
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
        _this.io.emit("Server.removeClient", socket.id);
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
        _this.io.emit("Server.chatMessage", JSON.stringify({
          type: "status",
          text: " has cleared the canvas.",
          sender: _this.clients[socket.id].name
        }));
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
        socket.emit("Server.updateClientList", JSON.stringify(_this.clients));
      });

      socket.on("Client.changeName", function(newName){
        console.log(timeStamp() + socket.id + " changed name to "+newName);
        var changed = _this.clientNameChange(socket, newName);
        _this.io.emit("Server.updateClient", JSON.stringify(changed));
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