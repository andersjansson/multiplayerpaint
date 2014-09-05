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

  this.socket = io();
  this.setupListeners();
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
        _this.drawFrame(e);
    });

    $(this.canvas).mouseup(function(e){
      _this.isPainting = false;
    });

    $(this.canvas).mouseleave(function(e){
      _this.isPainting = false;
    });

    this.socket.on("otherUserDrawing", function(data){
      var d = JSON.parse(data);
      _this.drawFrameOther(d.sX, d.sY, d.eX, d.eY);
    });

    this.socket.on("drawFullCanvas", function(data){
      _this.drawFullCanvas(data);
    });
  }      

  CanvasApp.prototype.drawFrame = function(e)
  {
    if(!this.isPainting)
      return;

    mouseX = e.pageX - this.canvas.offsetLeft;
    mouseY = e.pageY - this.canvas.offsetTop;

    this.sendData(this.startX, this.startY, mouseX, mouseY);

    this.context.beginPath();
    this.context.moveTo(this.startX, this.startY);

    this.context.lineTo(mouseX, mouseY);
    this.context.stroke();

    this.startX = mouseX;
    this.startY = mouseY;
  }

  CanvasApp.prototype.drawFrameOther = function(sX,sY,eX,eY)
  {
    this.context.beginPath();
    this.context.moveTo(sX, sY);

    this.context.lineTo(eX, eY);
    this.context.stroke();
  }

  CanvasApp.prototype.sendData = function(startX,startY,endX,endY)
  {
    this.socket.emit("draw", JSON.stringify({
      "sX" : startX,
      "sY" : startY,
      "eX" : endX,
      "eY" : endY
    }));
  }

  CanvasApp.prototype.draw = function(a,b,c,d)
  {

  }
  
  CanvasApp.prototype.drawFullCanvas = function(JSONstring){
    var dataObject = JSON.parse(JSONstring);

    for(var i=0; i < dataObject.length; i++) {    
      this.drawFrameOther(dataObject[i].sX, dataObject[i].sY, dataObject[i].eX, dataObject[i].eY);
    }
  }