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
requirejs(['jquery', 'socket.io','jscolor','client','bootstrap','bootstrap-slider'],
function($, io, jscolor,app) {
  $(function(){
    jscolor.install();
    jscolor.init();
    var socket = io.connect();
    var app = new CanvasApp(socket);
    app.loader.start("Loading, please wait...");
  });
});