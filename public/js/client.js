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

    this.socket.on("otherUserDrawingLine", function(data){
      var d = JSON.parse(data);
      _this.drawLineOther(d.sX, d.sY, d.eX, d.eY, d.color, d.size);
    });

    this.socket.on("drawFullCanvas", function(data){
      _this.drawFullCanvas(data);
      //console.log(_this.canvas.toDataURL());


      //istället för att skicka datan
    });

    this.socket.on("ClientId", function(socketId){
     console.log(socketId);

     //console.log(_this.canvas.toDataURL());
    });
    
   /* this.socket.on("getDataURLol", function(data){
     //console.log(dataImg);
      console.log(data);
      _this.drawFullCanvas(data);
     //console.log(_this.canvas.toDataURL());
    }); */
    
    this.socket.on("RequestDataURL", function(data){
       // var lol = _this.canvas.toDataURL();
        //console.log(lol);
        _this.socket.emit("getDataURL",_this.canvas.toDataURL());
        //console.log(_this.canvas.toDataURL());
      
    });

    this.socket.on("drawBackup", function(data){
      _this.drawBackup(data);
    });
  }

  CanvasApp.prototype.setupListeners = function()
  {
    var _this = this;

    $(this.canvas).mousedown(function(e){
      _this.startX = e.pageX - this.offsetLeft;
      _this.startY = e.pageY - this.offsetTop;
      _this.clickX = _this.startX;
      _this.clickY = _this.startY;

      if(!_this.toolKit.pointer.eyeDropper.selected)
        _this.isPainting = true;
    });

    $(this.canvas).mousemove(function(e){
        _this.drawLineSelf(e);

        //if eyedropper is selected
        if(_this.toolKit.pointer.eyeDropper.selected){
          var mouseX = e.pageX - _this.canvas.offsetLeft;
          var mouseY = e.pageY - _this.canvas.offsetTop;
          var cData = _this.toolKit.pointer.eyeDropper.getColor(mouseX, mouseY);

          if(cData[0] == 0 && cData[1] == 0 && cData[2] == 0 && cData[3] == 0)
            _this.toolKit.colorPicker.color.fromRGB(1,1,1);

          else
            _this.toolKit.colorPicker.color.fromRGB(cData[0]/255, cData[1]/255, cData[2]/255);
        }
    });

    $(document).mousemove(function(e){
      _this.toolKit.pointer.move(e);
    });

    $(this.canvas).mouseenter(function(e){
        _this.toolKit.pointer.show();
    });

    $(this.canvas).mouseout(function(e){
      if (!_this.toolKit.pointer.eyeDropper.selected)
        _this.toolKit.pointer.hide();
    });

    $(document).mouseup(function(e){

      //if eyedropper is selected
      if (_this.toolKit.pointer.eyeDropper.selected) {
        var cData = _this.toolKit.pointer.eyeDropper.getColor(_this.clickX, _this.clickY);
        var col = "rgb("+cData[0]+","+cData[1]+","+cData[2]+")";
        
        if(cData[0] == 0 && cData[1] == 0 && cData[2] == 0 && cData[3] == 0){
          col = "rgb(255,255,255)";
          _this.toolKit.colorPicker.color.fromRGB(1,1,1);
        }
        else
          _this.toolKit.colorPicker.color.fromRGB(cData[0]/255, cData[1]/255, cData[2]/255);

        _this.color = col;
        _this.toolKit.pointer.brush.setColor(col);
        _this.toolKit.pointer.setCursor(_this.toolKit.pointer.brush);
        _this.toolKit.pointer.hide();
        _this.toolKit.pointer.show();
      }
      //if eyedropper is not selected
      else
        _this.singleClick(e);
        //console.log(_this.canvas.toDataURL());
        //this.canvassendDataURL();
        //_this.socket.emit("sendDataURL", canvasURL);
        _this.socket.on("RequestDataURL", function(data){
       // var lol = _this.canvas.toDataURL();
        //console.log(lol);
        var canvasURL = _this.canvas.toDataURL();
        console.log(canvasURL);
        _this.socket.emit("getDataURL",canvasURL);
        //console.log(_this.canvas.toDataURL());
        });
        //this.sendDataURL(canvasURL); 
      _this.toolKit.pointer.eyeDropper.selected = false;
      _this.singleClick(e);
      _this.isPainting = false;

    });
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
    this.socket.emit("drawLine", JSON.stringify({
      "type"  : type,
      "sX"    : sX,
      "sY"    : sY,
      "eX"    : eX,
      "eY"    : eY,
      "color" : color,
      "size"  : size
    }));
  }  

  CanvasApp.prototype.sendDataURL = function(canvasURL)
  {
    this.socket.emit("sendDataURL", canvasURL);
  }
  CanvasApp.prototype.drawFullCanvas2 = function(JSONstring){
    
    console.log(this.canvas.toDataURL());
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

  
  CanvasApp.prototype.drawFullCanvas = function(JSONstring){

    /*console.log(imgData);
    var myImage = new Image();
    myImage.src = imgData;
    this.context.drawImage(myImage, 1024, 700);
    console.log(myImage);

    //ctx.drawImage(myImage, 0, 0);*/
    var dataObject = JSON.parse(JSONstring);
    
    for(var i=0; i < dataObject.length; i++) {    
      this.drawLineOther(
        dataObject[i].sX, 
        dataObject[i].sY, 
        dataObject[i].eX, 
        dataObject[i].eY, 
        dataObject[i].color,
        dataObject[i].size
      );
    }
    //console.log(this.canvas.toDataURL());
  }


function ToolKit(canvasApp)
{
  this.app = canvasApp;
  this.color;
  this.brushSize;

  this.init();
  this.setupListeners();
}

  ToolKit.prototype.init = function()
  {
    var _this = this;

    this.colorPicker = document.getElementById("cp");
    this.slider = $(".slider");
    this.pointer = new FancyMousePointer(this);
    this.eraser = $("#eraser");

    this.slider.slider({
      min: 1,
      max: 100,
      step: 1,
      orientation: "horizontal",
      value: 5,
      tooltip: "hide"
    });

    //ser till att colorpickern börjar med svart
    this.setInitialColor("000");
  }

  ToolKit.prototype.setInitialColor = function(c)
  {
    var _this = this;

    setTimeout(function(){
      if(_this.colorPicker.color)
        _this.colorPicker.color.fromString(c);
      else
        _this.setInitialColor(c);
      
      _this.app.setColor(_this.colorPicker.style.backgroundColor);  
      _this.pointer.brush.setColor(_this.colorPicker.style.backgroundColor);
    }, 50);
    
  }

  ToolKit.prototype.setupListeners = function()
  {
    var _this = this;

    //färgväljaren ändras
    $(this.colorPicker).change(function(){
      _this.setColor(_this.colorPicker.style.backgroundColor);
    });

    //slidern flyttas
    this.slider.on('slideStop', function(e){
      setTimeout(function(){
        _this.app.setSize(_this.slider.val());
        _this.pointer.brush.setSize(_this.slider.val());
        _this.pointer.setCursor(_this.pointer.brush);
      }, 1);
    });

    this.eraser.click(function(){
      _this.setColor("rgb(255,255,255)");
    });
  }

  ToolKit.prototype.setColor = function(c)
  {
    this.app.setColor(c)
    this.pointer.brush.setColor(c);
    this.pointer.setCursor(_this.pointer.brush);
  }

//sköter muspekaren
function FancyMousePointer(kit)
{
  this.size = 5;
  this.color;

  this.kit = kit;
  this.init();

}
  FancyMousePointer.prototype.init = function()
  {
    this.eyeDropper = new EyeDropper(this);
    this.brush      = new Brush(this);

    this.brush.setSize(this.kit.app.size);
    this.brush.setColor(this.kit.app.color);

    this.setCursor(this.brush);

    this.hide();
  }

  FancyMousePointer.prototype.move = function(e)
  {
    var mouseX = e.pageX - this.brush.size/2;
    var mouseY = e.pageY - this.brush.size/2;

    this.div.css({
      "top": mouseY,
      "left": mouseX
    });
  }

  FancyMousePointer.prototype.show = function(e)
  {
    this.div.css("display", "inline");
  }

  FancyMousePointer.prototype.hide = function()
  {
    this.div.css("display", "none");
  }

  FancyMousePointer.prototype.setCursor = function(tool)
  {
    this.div = tool.div;
    $("body").append(this.div);
  }

  FancyMousePointer.prototype.removeCursor = function()
  {
    this.div.remove();
  }

    function EyeDropper(pointer)
    {
      this.pointer = pointer;
      this.selected = false;

      this.img = $("#eyedropper");
      this.div = $("<div id='eyeDropperDiv'>");

      this.setupListeners();
    }
      EyeDropper.prototype.setupListeners = function()
      {
        var _this = this;
        this.img.click(function(){
          _this.selected = true;
          _this.pointer.setCursor(_this);
        });
      }

      EyeDropper.prototype.getColor = function(x,y)
      {
        var c = this.pointer.kit.app.context.getImageData(x,y,1,1).data;
        return c;
      }

    function Brush(pointer)
    {
      this.div = $("<div id='brushDiv'>");

      this.color;
      this.size;
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
