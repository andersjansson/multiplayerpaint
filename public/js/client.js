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

    this.pointer = new FancyMousePointer(this);

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
    });
  }

  CanvasApp.prototype.setupListeners = function()
  {
    var _this = this;

    $(this.canvas).mousedown(function(e){
      _this.startX = e.pageX - this.offsetLeft;
      _this.startY = e.pageY - this.offsetTop;

      _this.isPainting = true;
    });

    $(this.canvas).mousemove(function(e){
        _this.drawLine(e);
    });

    $(document).mousemove(function(e){
      _this.pointer.move(e);
    });

    $(this.canvas).mouseenter(function(e){
        _this.pointer.show();
    });

    $(this.canvas).mouseout(function(e){
        _this.pointer.hide();
    });

    $(this.canvas).mouseup(function(e){
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

  CanvasApp.prototype.drawLine = function(e)
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
    //console.log("incoming size: "+size);
    //console.log("drawing with size: "+this.context.lineWidth);

    this.context.beginPath();
      this.context.strokeStyle = color;
      this.context.lineWidth   = size;
      //console.log("drawing with size: "+this.context.lineWidth);
      this.context.moveTo(sX, sY);
      this.context.lineTo(eX, eY);
    this.context.closePath();

      this.context.stroke();
    
  }

  CanvasApp.prototype.sendData = function(sX,sY,eX,eY,color,size)
  {
    //console.log("sendData, size: "+size);

    this.socket.emit("drawLine", JSON.stringify({
      "sX"    : sX,
      "sY"    : sY,
      "eX"    : eX,
      "eY"    : eY,
      "color" : color,
      "size"  : size
    }));
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
      _this.app.pointer.setColor(_this.colorPicker.style.backgroundColor);
    });

    //slidern flyttas
    this.slider.on('slideStop', function(e){
      setTimeout(function(){
        _this.app.setSize(_this.slider.val());
        _this.app.pointer.setSize(_this.slider.val());
      }, 1);
      
    });
  }

//sköter muspekaren
function FancyMousePointer(app)
{
  this.size;
  this.color;

  this.div = $("#brushDiv");

  this.app = app;
  this.init();

}
  FancyMousePointer.prototype.init = function()
  {
    this.setSize(this.app.size);
    this.setColor(this.app.color);

    this.hide();
  }

  FancyMousePointer.prototype.show = function(e)
  {
    this.div.css("visibility", "visible");
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

  FancyMousePointer.prototype.hide = function()
  {
    this.div.css("visibility", "hidden");
  }

  FancyMousePointer.prototype.setSize = function(size)
  {
    console.log("changing size");
    this.size = size;
    this.div.css({"width": size, "height": size});
  }

  FancyMousePointer.prototype.setColor = function(color)
  {
    this.color = color;
    this.div.css("background", color);
  }