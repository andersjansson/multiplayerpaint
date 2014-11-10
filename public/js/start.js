requirejs.config({
    baseUrl: '../js/lib',
    shim: {
      "bootstrap"       : {deps:['jquery']},
      "bootstrap-slider": { deps :['bootstrap'] },
      "client": { deps :['bootstrap','jquery', 'bootstrap-slider','jscolor'] }
    },

    paths: {
      client      : '../paint/client',
      chat        : '../paint/chat',
      jscolor     : 'jscolor/jscolor',
      "socket.io" : '/socket.io/socket.io',
      utility     : '../util/utility',
      loader      : '../util/loader'
    }
});

// Start the main app logic.
requirejs(['jquery', 'socket.io','jscolor','client','bootstrap','bootstrap-slider', 'chat', 'utility', 'loader'],
function($, io, jscolor) {
  $(function(){
    jscolor.install();
    jscolor.init();
    var socket = io.connect();
    var loader = new Loader(document.getElementById("canvas"));
    loader.start("Loading, please wait...");
    var app = new CanvasApp(socket,loader);
    var chat = new ChatApp($("#chat-window"), socket);
    
  });
});