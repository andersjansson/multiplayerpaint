requirejs.config({
    baseUrl: '../js/lib',
    shim: {
      "bootstrap"       : {deps:['jquery']}
    }
});

requirejs(['jquery', 'bootstrap'],
function($) {
  $(function(){

		

  });

});