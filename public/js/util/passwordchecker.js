function PasswordChecker(id,fn)
{
  this.$modal = $(".password-modal-wrapper");
  this.$form = $(".room-password-check");
  this.$message = $(".password-message");
  this.id = id;
  console.log("PASSWORCHECKER INITIALIZED! id: " +id);
  this.startCanvasApp = fn;

  this.init();
}

  PasswordChecker.prototype.init = function()
  {
    var _this = this;

    this.$form.on("submit", function(e){
      e.preventDefault();

      //var password = $(' :input');
      var password = $(this)[0][0].value;
      console.log(password);

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
    $("#password-modal-vertical-align").toggleClass("opaque");
    setTimeout(function(){
      _this.$modal.toggleClass("visible");
    }, 300);

    this.startCanvasApp();
  }
