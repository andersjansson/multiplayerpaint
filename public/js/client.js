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

    this.toolKit = new ToolKit(this);

    this.color = "rgb(0,0,0)";
    this.size  = 5;

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
    
    this.socket.on("sendImg", function(dataImg){
     console.log(dataImg);

     //console.log(_this.canvas.toDataURL());
    });
    
    this.socket.on("RequestDataURL", function(data){
        var lol = _this.canvas.toDataURL();
        console.log(lol);
        _this.socket.emit("getDataURL",_this.canvas.toDataURL());
        console.log(_this.canvas.toDataURL());
      
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
        
        _this.toolKit.pointer.setColor(col);
        _this.toolKit.pointer.eyeDropper.selected = false;
        _this.toolKit.pointer.color = this.color;
        _this.toolKit.pointer.show();
      }

      //if eyedropper is not selected
      else
        _this.singleClick(e);
        console.log(_this.canvas.toDataURL());
      _this.isPainting = false;
    });
  }

  CanvasApp.prototype.getColorData = function()
  {

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
    
    this.sendData(this.startX, this.startY, mouseX, mouseY, this.color, this.size);

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
    //console.log(this.context.closePath());
    
      this.context.stroke();
      //this.socket.emit("sendPath", this.context.closePath());
      //console.log(this.canvas.toDataURL());
    
  }

  CanvasApp.prototype.sendData = function(sX,sY,eX,eY,color,size)
  {

    this.socket.emit("drawLine", JSON.stringify({
      "sX"    : sX,
      "sY"    : sY,
      "eX"    : eX,
      "eY"    : eY,
      "color" : color,
      "size"  : size
    }));
  }

  CanvasApp.prototype.sendDataURL = function()
  {

    this.socket.emit("sendDataURL", this.canvas.toDataURL());
  }
  CanvasApp.prototype.drawFullCanvas2 = function(JSONstring){
    
    console.log(this.canvas.toDataURL());
  }

  
  CanvasApp.prototype.drawFullCanvas = function(JSONstring){
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
    console.log(this.canvas.toDataURL());
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

    this.slider.slider({
      min: 1,
      max: 100,
      step: 1,
      orientation: "horizontal",
      value: 5,
      tooltip: "hide"
    });

    //fulfix för att se till att colorpickern börjar med svart
    setTimeout(function(){
      _this.colorPicker.color.fromString("000");
      _this.app.setColor(_this.colorPicker.style.backgroundColor);  
    }, 1);
  }

  ToolKit.prototype.setupListeners = function()
  {
    var _this = this;

    //färgväljaren ändras
    $(this.colorPicker).change(function(){
      _this.app.setColor(_this.colorPicker.style.backgroundColor);
      _this.pointer.setColor(_this.colorPicker.style.backgroundColor);
    });

    //slidern flyttas
    this.slider.on('slideStop', function(e){
      setTimeout(function(){
        _this.app.setSize(_this.slider.val());
        _this.pointer.setSize(_this.slider.val());
      }, 1);
    });
  }

//sköter muspekaren
function FancyMousePointer(kit)
{
  this.size;
  this.color;

  this.eyeDropper = new EyeDropper(this);

  this.div = $("#brushDiv");

  this.kit = kit;
  this.init();

}
  FancyMousePointer.prototype.init = function()
  {
    this.setSize(this.kit.app.size);
    this.setColor(this.kit.app.color);

    this.eyeDropper = new EyeDropper(this);

    this.hide();
  }

  FancyMousePointer.prototype.move = function(e)
  {
    var mouseX = e.pageX - this.size/2;
    var mouseY = e.pageY - this.size/2;

    this.div.css({
      "top": mouseY,
      "left": mouseX
    });
  }

  FancyMousePointer.prototype.show = function(e)
  {
    if(!this.eyeDropper.selected)
      this.div.css("visibility", "visible");
  }

  FancyMousePointer.prototype.hide = function()
  {
    this.div.css("visibility", "hidden");
  }

  FancyMousePointer.prototype.setSize = function(size)
  {
    this.size = size;
    this.div.css({"width": size, "height": size});
  }

  FancyMousePointer.prototype.setColor = function(color)
  {
    this.color = color;
    this.div.css("background", color);
  }

  FancyMousePointer.prototype.imgCursor = function(img)
  {
    this.div.css('background-image', 'url(' + img + ')');
  }

    function EyeDropper(pointer)
    {
      this.pointer = pointer;
      this.selected = false;
      this.img = $("#eyedropper");

      this.setupListeners();
    }
      EyeDropper.prototype.setupListeners = function()
      {
        var _this = this;
        this.img.click(function(){
          _this.selected = true;
          _this.pointer.imgCursor("img/eyedropper.png");
        });
      }

      EyeDropper.prototype.getColor = function(x,y)
      {
        var c = this.pointer.kit.app.context.getImageData(x,y,1,1).data;
        return c;
      }