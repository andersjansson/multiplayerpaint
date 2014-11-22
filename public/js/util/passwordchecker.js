function PasswordChecker()
{
  this.$divs = $(".thumb img");
  this.$modal;
  this.isModal = false;

  this.setupModal();
  this.setupListeners();
}

  PasswordChecker.prototype.setupModal = function()
  {
    this.$modal = $("<div>", {
      id: "gallery-modal-container"
    }).appendTo("body");
    
    var b = $("<div>", {
      id: "gallery-modal-vertical-align"
    }).appendTo(this.$modal);

    var c = $("<div>", {
      id: "gallery-modal-horizontal-align"
    }).appendTo(b);

    var d = $("<div>", {
      id: "gallery-modal-image-container"
    }).appendTo(c);

  }

  PasswordChecker.prototype.toggleModal = function(fadeIn)
  {
    var _this = this;

    if(fadeIn)
    {
      _this.$modal.toggleClass("visible");
      _this.$modal.css("opacity");
      $("#gallery-modal-vertical-align").toggleClass("opaque");
      _this.showModal();
      _this.isModal = true;
    }
    
    else
    {
      $("#gallery-modal-vertical-align").toggleClass("opaque");
      setTimeout(function(){
        _this.$modal.toggleClass("visible");
        _this.isModal = false;
      }, 300);
    }
  }

  PasswordChecker.prototype.showModal = function()
  {
    var _this = this;

    $("#gallery-modal-image-container").empty();

    $("#gallery-modal-image-container").append("<p>lol wat</p>");
  }