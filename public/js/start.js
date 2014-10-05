requirejs.config({
    baseUrl: 'js/lib',
    shim: {
      "bootstrap"       : {deps:['jquery']},
      "bootstrap-slider": { deps :['bootstrap'] },
      "client": { deps :['bootstrap','jquery', 'bootstrap-slider','jscolor'] }
    },

    paths: {
      client       : '../paint/client',
      jscolor     : 'jscolor/jscolor',
      "socket.io" : '/socket.io/socket.io'
    }
});

// Start the main app logic.
requirejs(['jquery', 'socket.io','jscolor','bootstrap','bootstrap-slider','client'],
function($, io, jscolor) {
  $(function(){
    jscolor.install();
    jscolor.init();
    var socket = io.connect();
    socket.on('connect', function(){
      var app = new CanvasApp();
      app.init(socket);
    });
  });
});