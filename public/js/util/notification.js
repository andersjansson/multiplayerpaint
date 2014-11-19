function NotificationHandler()
{
  this.x;
  this.y;
  this.messageDiv = $("<div class='notification'>");
  $("body").append(this.messageDiv);

  this.init();
}
  NotificationHandler.prototype.init = function()
  {

  }


  NotificationHandler.prototype.showNotification = function(msg, clickEvent)
  {
    this.messageDiv.html(msg);

    if(typeof clickEvent !== "undefined"){
      var disableTooltipDiv = $(clickEvent.target).parent();
      this.messageDiv.css("left",clickEvent.pageX-this.messageDiv.width());
      this.messageDiv.css("top",clickEvent.pageY-this.messageDiv.height()*3);
      disableTooltipDiv.toggleClass("hover-tooltip");
    }

    var _this = this;

    


    this.messageDiv.fadeTo(150,0.8, function(){
      setTimeout(function(){
        if(typeof disableTooltipDiv !== "undefined")
          disableTooltipDiv.toggleClass("hover-tooltip");

        _this.hideNotification();
      }, 1500);
    });
    /*
    
    */
  }

  NotificationHandler.prototype.hideNotification = function()
  {
    this.messageDiv.fadeOut(150, function(){});
  }