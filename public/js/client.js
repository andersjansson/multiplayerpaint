function CanvasApp()
{
  this.canvas = document.getElementById('canvas');
  this.context = this.canvas.getContext("2d");
  this.isPainting = false;

  this.clickX = new Array();
  this.clickY = new Array();
  this.clickDrag = new Array();

  this.startX;
  this.startY;

  this.clickX;
  this.clickY;

  this.init();  
}
  CanvasApp.prototype.init = function()
  {
    this.socket = io();
    this.setupListeners();
    this.setupSocketEvents();

    this.color = "rgb(0,0,0)";
    this.size  = 5;

    this.toolKit = new ToolKit(this);

    this.context.lineJoin = "round";

    this.setColor(this.color);
  }

  CanvasApp.prototype.setupSocketEvents = function()
  {
    var _this = this;

    this.socket.on("Server.otherUserDrawingLine", function(data){
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

    this.socket.on("drawFullCanvas", function(data){
      _this.drawFullCanvas(data);
    });

    this.socket.on("ClientId", function(socketId){
     console.log(socketId);
    });
        
    this.socket.on("Server.RequestDataURL", function(data){
      console.log("lol got a request from server");
        var lol = _this.canvas.toDataURL();
        //console.log(lol);
        _this.socket.emit("Client.sendDataURL",_this.canvas.toDataURL());
        //console.log(_this.canvas.toDataURL());
      
    });

    this.socket.on("Server.sendDataURL", function(dataURL){
      _this.drawCanvasFromDataURL(dataURL);
    });

    this.socket.on("Server.drawBackup", function(data){
      _this.drawBackup(data);
    });

    this.socket.on("Server.trashPainting", function(data){
      console.log("clienten fått order om att cleara canvas!");
      _this.clearCanvas();
    });
  }

  CanvasApp.prototype.setupListeners = function()
  {
    var _this = this;

    $("#trash").click(function(e){
      console.log("trash clicked!");
      _this.socket.emit("Client.clearCanvas");
      _this.clearCanvas();

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
          var cData = _this.toolKit.eyeDropper.getColor(mouseX, mouseY);

          if(cData[0] == 0 && cData[1] == 0 && cData[2] == 0 && cData[3] == 0)
            _this.toolKit.colorPicker.color.fromRGB(1,1,1);

          else
            _this.toolKit.colorPicker.color.fromRGB(cData[0]/255, cData[1]/255, cData[2]/255);
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
    });

    $(document).mouseup(function(e){

      //if eyedropper is selected
      if (_this.toolKit.eyeDropper.selected) {
        var cData = _this.toolKit.eyeDropper.getColor(_this.clickX, _this.clickY);
        var col = "rgb("+cData[0]+","+cData[1]+","+cData[2]+")";
        
        if(cData[0] == 0 && cData[1] == 0 && cData[2] == 0 && cData[3] == 0){
          col = "rgb(255,255,255)";
          _this.toolKit.colorPicker.color.fromRGB(1,1,1);
        }
        else
          _this.toolKit.colorPicker.color.fromRGB(cData[0]/255, cData[1]/255, cData[2]/255);

        _this.color = col;
        _this.toolKit.brush.setColor(col);
        _this.toolKit.setCursor(_this.toolKit.brush);
        _this.toolKit.hideCursor();
        _this.toolKit.showCursor();
      }
 
      _this.toolKit.eyeDropper.selected = false;
      _this.singleClick(e);
      _this.isPainting = false;

    });
  }

  CanvasApp.prototype.clearCanvas = function()
  {
    //
    console.log("canvasen ska clearats nu!" + this.canvas.height + this.canvas.width);
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
    var myImage = new Image();
    myImage.src = dataURL;
      console.log("draw that image!");
      _this.context.drawImage(myImage, 0, 0);
  
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

  //FIXA BÄTTRE
  ToolKit.prototype.setInitialColor = function(c)
  {
    var _this = this;

    setTimeout(function(){
      if(_this.colorPicker.color){
        _this.colorPicker.color.fromString(c);
        _this.app.setColor(_this.colorPicker.style.backgroundColor);  
        _this.brush.setColor(_this.colorPicker.style.backgroundColor);
      }
      else
        _this.setInitialColor(c);
    }, 50);
    
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
  }

  ToolKit.prototype.setColor = function(c, eraser)
  {
    this.app.setColor(c)
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

  EyeDropper.prototype.getColor = function(x,y)
  {
    var c = this.kit.app.context.getImageData(x,y,1,1).data;
    return c;
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
    });
  }
