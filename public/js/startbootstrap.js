requirejs.config({
    baseUrl: '../js/lib',
    shim: {
      "bootstrap"       : {deps:['jquery']}
    }
});

requirejs(['jquery', 'bootstrap'],
function($) {
  $(function(){

		$("#yesCheck, #noCheck").on("click",function()
		{

			if (document.getElementById('yesCheck').checked) 
			{
		        document.getElementById('ifYes').style.display = 'block';
		    }
		    else document.getElementById('ifYes').style.display = 'none';

		});

  });

});