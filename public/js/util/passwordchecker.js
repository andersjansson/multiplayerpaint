function PasswordChecker(id,fn)
{
  this.$modal = $(".password-modal-wrapper");
  this.$form = $(".room-password-check");
  this.$message = $(".password-message");
  this.id = id;
  this.startCanvasApp = fn;

  this.init();
}

  PasswordChecker.prototype.init = function()
  {
    var _this = this;

    this.$form.on("submit", function(e){
      e.preventDefault();

      var password = $(this)[0][0].value;

      $.ajax({
        type: "POST",
        url: "/checkroompassword",
        data: {"password": password, roomId: _this.id}
      }).done(function( response ) {
          switch(response){
            case "correct":
              _this.remove();
              break;
            case "wrong":
              _this.$message.html("<span class='red'>Incorrect.</span> Try again or go <a href='/'>back</a>.");
              _this.$form[0][0].value = "";
              break;

            default:

              break;
          }

        });
      ;

    });
  }

  PasswordChecker.prototype.remove = function()
  {
    var _this = this;

    $(".password-modal-vertical-align").toggleClass("opaque");
    setTimeout(function(){
      _this.$modal.toggleClass("visible");
      $(".password-modal-wrapper").css({"display" : "none"});
    }, 300);

    this.startCanvasApp();
  }
