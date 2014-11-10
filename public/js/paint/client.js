function CanvasApp(io, loader)
{
  this.canvas = document.getElementById('canvas');
  this.loader = loader;
  this.toolKit = new ToolKit(this);

  this.socket = io;
  
  this.context = this.canvas.getContext("2d");
  this.isPainting = false;

  this.clickX = new Array();
  this.clickY = new Array();
  this.clickDrag = new Array();

  this.startX;
  this.startY;

  this.clickX;
  this.clickY;

  this.clientCount;

  this.init();
}
  CanvasApp.prototype.init = function(io)
  {
    var _this = this;

    this.socket.on('connect', function(){
      _this.setupSocketEvents();
      _this.socket.emit("Client.requestClientCount");

      console.log("Requesting dataURL");
      
      _this.socket.emit("Client.requestDataURL");
    });

    this.color = "rgb(0,0,0)";
    this.size  = 5;

    this.context.lineJoin = "round";

    this.setColor(this.color);

    this.setupListeners();
  }

  CanvasApp.prototype.setupSocketEvents = function()
  {
    var _this = this;
    
    this.socket.on("Server.otherUserDrawingLine", function(data){
      console.log("other user drawing");
      var d = JSON.parse(data);
      switch(d.type){
        case "arc":
          _this.drawArcOther(d.sX, d.sY, d.color, d.size);
          break;
        default:
          _this.drawLineOther(d.sX, d.sY, d.eX, d.eY, d.color, d.size);
          break;
      }
    });

    this.socket.on("Server.requestDataURL", function(data, callback){
      console.log("got a request from server");
        var lol = _this.canvas.toDataURL();
        callback(null, _this.canvas.toDataURL());
    });

    this.socket.on("Server.sendDataURL", function(dataURL, callback){
      console.log("server sending dataURL");
      _this.drawCanvasFromDataURL(dataURL);
      callback(true);
    });

    this.socket.on("Server.drawBackup", function(data, callback){
      console.log("server sending backup");
      _this.drawBackup(data);
      callback(true);
    });

    this.socket.on("Server.trashPainting", function(data){
      console.log("clienten fått order om att cleara canvas!");
      _this.clearCanvas();
    });

    this.socket.on("Server.updateClientCount", function(data){
      _this.clientCount = data;
    });

    this.socket.on("Server.startLoader", function(msg){
      _this.loader.start(msg);
    });

    this.socket.on("Server.stopLoader", function(msg){
      _this.loader.stop();
    });
  }

  CanvasApp.prototype.setupListeners = function()
  {
    var _this = this;

    $("#trash").click(function(e){
      _this.socket.emit("Client.clearCanvas");
      _this.clearCanvas();
    });
    $("#saveImage").click(function(e){
      console.log("Ber servern att spara bilden");
      _this.socket.emit("Client.saveDataURL",_this.canvas.toDataURL());
    });
    $(this.canvas).mousedown(function(e){
      _this.startX = e.pageX - this.offsetLeft;
      _this.startY = e.pageY - this.offsetTop;
      _this.clickX = _this.startX;
      _this.clickY = _this.startY;

      if(!_this.toolKit.eyeDropper.selected)
        _this.isPainting = true;
    });

    $(this.canvas).mousemove(function(e){
        _this.drawLineSelf(e);

        //if eyedropper is selected
        if(_this.toolKit.eyeDropper.selected){
          var mouseX = e.pageX - _this.canvas.offsetLeft;
          var mouseY = e.pageY - _this.canvas.offsetTop;
          var cData = _this.context.getImageData(mouseX, mouseY,1,1).data;
          _this.toolKit.eyeDropper.setColorFromCData(cData);
        }
    });

    $(document).mousemove(function(e){
      _this.toolKit.moveCursor(e);
    });

    $(this.canvas).mouseenter(function(e){
        _this.toolKit.showCursor();
    });

    $(this.canvas).mouseout(function(e){
      if (!_this.toolKit.eyeDropper.selected)
        _this.toolKit.hideCursor();
      else
        _this.toolKit.colorPicker.color.fromString(_this.color);
        
    });

    $(this.canvas).mouseup(function(e){

      //if eyedropper is selected
      if (_this.toolKit.eyeDropper.selected) {
        var cData = _this.context.getImageData(e.pageX - this.offsetLeft, e.pageY - this.offsetTop,1,1).data;
        var col = _this.toolKit.eyeDropper.setColorFromCData(cData);
        
        _this.color = col;
        _this.toolKit.brush.setColor(col);
        _this.toolKit.setCursor(_this.toolKit.brush);
        _this.toolKit.hideCursor();
        _this.toolKit.showCursor();
      }
      
      _this.toolKit.eyeDropper.selected = false;
      _this.singleClick(e);

      if(_this.clientCount == 1 && !_this.toolKit.eyeDropper.selected){
        console.log("I AM SO ALONE! SENDING DATAURL!");
        _this.socket.emit("Client.sendDataURL",_this.canvas.toDataURL());
      }
    });
    $(document).mouseup(function(){
      _this.isPainting = false;
    });

    $(this.canvas).bind('mousewheel DOMMouseScroll', function(event){
      if(_this.toolKit.brush.icon.hasClass("active") || _this.toolKit.eraser.icon.hasClass("active")){
        event.preventDefault();

        var mySlider = _this.toolKit.slider;
        var newValue = mySlider.data('slider').getValue();

        if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
          mySlider.slider('setValue', newValue+3);
        }
        else {
          mySlider.slider('setValue', newValue-3);
        }

        _this.setSize(newValue);
        _this.toolKit.brush.setSize(newValue);
        _this.toolKit.moveCursor(event);
      }
    });
  }

  CanvasApp.prototype.clearCanvas = function()
  {
    this.context.clearRect ( 0 , 0 ,  this.canvas.width , this.canvas.height );
  }

  CanvasApp.prototype.setColor = function(newColor)
  {
    this.color = newColor;
  }

  CanvasApp.prototype.setSize = function(newSize)
  {
    this.size = newSize;
  }

  CanvasApp.prototype.singleClick = function(e)
  {
    var endPosX = e.pageX - this.canvas.offsetLeft;
    var endPosY = e.pageY - this.canvas.offsetTop;

    if(this.isPainting && this.clickX == endPosX && this.clickY == endPosY){
      this.context.beginPath();
      this.context.fillStyle = this.color;
      this.context.arc(this.clickX, this.clickY, this.size/2, 0, 2*Math.PI);
      this.context.closePath();
      this.context.fill();
    }
    this.sendData("arc",this.clickX, this.clickY, 0, 0, this.color, this.size);
  }

  CanvasApp.prototype.drawArcOther = function(posX,posY,color,size)
  {
    this.context.beginPath();
      this.context.fillStyle = color;
      this.context.arc(posX, posY, size/2, 0, 2*Math.PI);
    this.context.closePath();
    this.context.fill();
  }

  CanvasApp.prototype.drawLineSelf = function(e)
  {
    if(!this.isPainting)
      return;

    var mouseX = e.pageX - this.canvas.offsetLeft;
    var mouseY = e.pageY - this.canvas.offsetTop;

    this.context.beginPath();
      this.context.strokeStyle = this.color;
      this.context.lineWidth   = this.size;
      this.context.moveTo(this.startX, this.startY);
      this.context.lineTo(mouseX, mouseY);
    this.context.closePath();

    this.context.stroke();
    
    this.sendData("line",this.startX, this.startY, mouseX, mouseY, this.color, this.size);

    this.startX = mouseX;
    this.startY = mouseY;
  }

  CanvasApp.prototype.drawLineOther = function(sX,sY,eX,eY,color,size)
  {
    this.context.beginPath();
      this.context.strokeStyle = color;
      this.context.lineWidth   = size;
      this.context.moveTo(sX, sY);
      this.context.lineTo(eX, eY);
    this.context.closePath();
    
      this.context.stroke();
  }

  CanvasApp.prototype.sendData = function(type,sX,sY,eX,eY,color,size)
  {
    this.socket.emit("Client.drawLine", JSON.stringify({
      "type"  : type,
      "sX"    : sX,
      "sY"    : sY,
      "eX"    : eX,
      "eY"    : eY,
      "color" : color,
      "size"  : size
    }));
  }  

  CanvasApp.prototype.drawBackup = function(imgData)
  {
    var dataObject = JSON.parse(imgData);

    for(var i=0; i < dataObject.length; i++) {
      switch(dataObject[i].type){
        case "arc":
          this.drawArcOther(
            dataObject[i].sX,
            dataObject[i].sY,
            dataObject[i].color,
            dataObject[i].size
          );
          break;
        default:
          this.drawLineOther(
            dataObject[i].sX, 
            dataObject[i].sY, 
            dataObject[i].eX, 
            dataObject[i].eY, 
            dataObject[i].color,
            dataObject[i].size
          );
          break;
      }
    }
  }

  CanvasApp.prototype.drawCanvasFromDataURL = function(dataURL){
    console.log("yay! I got me some dataURL");
    var _this = this;
    var img = new Image();

    img.onload = function(){
      _this.context.drawImage(img, 0, 0);
    }

    img.src = dataURL;
  }

function ToolKit(canvasApp)
{
  this.app = canvasApp;
  this.color;
  this.brushSize;

  this.init();
}

  ToolKit.prototype.init = function()
  {
    var _this = this;

    this.colorPicker = document.getElementById("cp");
    this.slider = $(".slider");
    this.slider.slider({
      min: 1,
      max: 100,
      step: 1,
      orientation: "horizontal",
      value: 5,
      tooltip: "hide"
    });
    this.brush = new Brush(this, 5);
    this.eraser = new Eraser(this);
    this.eyeDropper = new EyeDropper(this);

    this.setupListeners();
    this.setInitialColor("000");

    this.brush.setSize(this.app.size);
    this.pointerDiv = (this.brush.div);
    this.setCursor(this.brush);
    this.hideCursor();
  }

  ToolKit.prototype.setInitialColor = function(c)
  {
    this.colorPicker.color.fromString(c);
    this.app.setColor(this.colorPicker.style.backgroundColor);  
    this.brush.setColor(this.colorPicker.style.backgroundColor);
  }

  ToolKit.prototype.setupListeners = function()
  {
    var _this = this;

    //färgväljaren ändras
    $(this.colorPicker).change(function(){
      _this.setColor(_this.colorPicker.style.backgroundColor, false);
      _this.setCursor(_this.brush, false);
    });

    //slidern flyttas
    this.slider.on('slideStop', function(e){
      setTimeout(function(){
        _this.app.setSize(_this.slider.val());
        _this.brush.setSize(_this.slider.val());
      }, 1);
    });

    $(document).keydown(function(e) {
     if (!$("#chat-input").is(":focus") && !$("#nick-input").is(":focus")){
        switch(e.keyCode){
          case 73: //I, Eyedropper
            _this.eyeDropper.selected = true;
            _this.setCursor(_this.eyeDropper);
            break;
          case 66: //B, Brush
            _this.setCursor(_this.brush, false);
            _this.setColor($(_this.colorPicker).css("background-color"), false);
            _this.eyeDropper.selected = false;
            break;
          case 69: //E, Eraser
            _this.setCursor(_this, true);
            _this.setColor("white", true);
            _this.eyeDropper.selected = false;
            break;
        }
      }    
    });
  }

  ToolKit.prototype.setColor = function(c, eraser)
  {
    this.app.setColor(c);
    this.brush.setColor(c);
    this.setCursor(this.brush, eraser);
  }

  ToolKit.prototype.setCursor = function(tool, eraser)
  {
    this.pointerDiv = tool.div;
    $("body").append(this.pointerDiv);
    $(".tool-icon").removeClass("active");

    if(eraser){
      this.eraser.icon.addClass("active");
    }
    else{
      tool.icon.addClass("active");
    }
      
  }

  ToolKit.prototype.removeCursor = function()
  {
    this.pointerDiv.remove();
  }

  ToolKit.prototype.showCursor = function(e)
  {
    this.pointerDiv.css("display", "inline");
  }

  ToolKit.prototype.hideCursor = function()
  {
    this.pointerDiv.css("display", "none");
  }

  ToolKit.prototype.moveCursor = function(e)
  {
    var mouseX = e.pageX - this.brush.size/2;
    var mouseY = e.pageY - this.brush.size/2;

    this.pointerDiv.css({
      "top": mouseY,
      "left": mouseX
    });
  }

function EyeDropper(kit)
{
  this.kit = kit;
  this.selected = false;

  this.icon = $("#eyedropper");
  this.div = $("<div id='eyeDropperDiv'>");

  this.setupListeners();
}
  EyeDropper.prototype.setupListeners = function()
  {
    var _this = this;
    this.icon.click(function(e){
      _this.selected = true;
      _this.kit.setCursor(_this);
    });

    
  }

  EyeDropper.prototype.setColorFromCData = function(cData)
  {
    var col = rgbToHex(cData[0],cData[1],cData[2]);
    
    //canvas background registers as black, we want it as white
    if(cData[0] == 0 && cData[1] == 0 && cData[2] == 0 && cData[3] == 0)
      col = "#FFFFFF";

    this.kit.colorPicker.color.fromString(col);

    return col;
  }

function Brush(kit, size)
{
  this.kit = kit;
  this.color;
  this.size = size;

  this.icon = $("#brush");
  this.div = $("<div id='brushDiv'>");

  this.setupListeners();
}

  Brush.prototype.setupListeners = function()
  {
    var _this = this;
    this.icon.click(function(e){
      _this.kit.setCursor(_this, false);
      _this.kit.setColor($(_this.kit.colorPicker).css("background-color"), false);
      _this.kit.eyeDropper.selected = false;
    });

     
  }

  Brush.prototype.setSize = function(size)
  {
    this.size = size;
    this.div.css({"width": size, "height": size});
  }

  Brush.prototype.setColor = function(color)
  {
    this.color = color;
    this.div.css("background", color);
  }

function Eraser(kit)
{
  this.kit = kit;
  this.div = $("<div id='brushDiv'>");
  this.icon = $("#eraser");

  this.setupListeners();
}

  Eraser.prototype.setupListeners = function()
  {
    var _this = this;
    this.icon.click(function(e){
      _this.kit.setCursor(_this, true);
      _this.kit.setColor("white", true);
      _this.kit.eyeDropper.selected = false;
    }); 
  }