function Loader(divToCover)
{
  this.div = divToCover;
  this.cover;
  this.init();
}

  Loader.prototype.init = function()
  {
    var cover = "<div id='loader' style='"
      +"width: "+this.div.offsetWidth+"px;"
      +"height: "+this.div.offsetHeight+"px;"
      +"left: "+this.div.offsetLeft+"px;"
      +"top: "+this.div.offsetTop+"px;'>";

    this.cover = $("body").prepend(cover).children(":first");
    this.cover.append("<img src='img/loading.gif'>");
    this.cover.append("<div id='loader-text'>");
  }

  Loader.prototype.start = function(msg)
  {
    $("#loader-text").html(msg);
    this.cover.show();
  }

  Loader.prototype.stop = function()
  {
    this.cover.hide();
  }