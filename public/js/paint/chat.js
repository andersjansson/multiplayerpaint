function ChatApp(div, socket)
{
  this.output = div;
  this.socket = socket;
  this.init();
}

  ChatApp.prototype.init = function()
  {
    var _this = this;

    this.textInput = $("#chat-input");
    this.nameInput  = $("#nick-input");
    this.statusBar = $("#chat-status");
    this.clientListDiv = $("#chat-client-list");
    this.setupListeners();
    this.clients = {};
  
    this.name;
    this.id;

    this.setupSocketEvents();
    
    this.socket.on("connect", function(){
      _this.id = _this.socket.io.engine.id;
      _this.name = _this.id.substr(0,7);
      _this.socket.emit("Client.requestClientList");
      _this.textInput.val('');
      _this.nameInput.val('');
    })
    
  }

  ChatApp.prototype.setupListeners = function()
  {
    var _this = this;

    this.textInput.keyup(function(e){
      if (e.keyCode === 13 && !e.shiftKey) {
        if($.trim(this.value).length > 0)
          _this.sendMessage("chat", $.trim(this.value), _this.name);
      }
    });
    this.nameInput.keyup(function(e){
      if (e.keyCode === 13) {
        _this.socket.emit("Client.changeName", this.value);
        _this.name = this.value;
        this.blur();
      }
    });

    $(window).resize(function(){
      _this.resizeChat();
    })
  }

  ChatApp.prototype.setupSocketEvents = function()
  {
    var _this = this;

    this.socket.on("Server.chatMessage", function(msg){
      _this.receiveMessage(msg);
    });

    this.socket.on("Server.addClient", function(client){
      var c = JSON.parse(client);
      _this.printMessage({type: "status", sender: c.name, text: " has connected"});
      _this.addClient(c);
      _this.renderClientList();
    });

    this.socket.on("Server.removeClient", function(id){
      _this.printMessage({type: "status", sender: _this.clients[id].name, text: " has disconnected"});
      _this.removeClient(id);
      _this.renderClientList();
    });

    this.socket.on("Server.updateClient", function(client){
      _this.updateClient(client);
      _this.renderClientList();
    });

    this.socket.on("Server.updateClientList", function(list){
      var l = JSON.parse(list);
      _this.renderClientList(l);
      _this.clients = l;
    });
  }

  ChatApp.prototype.sendMessage = function(type, message, sender)
  {
    var sentBy = ($.trim(sender) != "") ? sender : this.name;
    var msg = new Message(type, message, sentBy);
    
    this.socket.emit("Client.sendChatMessage", JSON.stringify(msg));
    this.textInput.val('');
    this.printMessage({
      type: "chat",
      text: escapeHTML(message),
      sender: escapeHTML(sentBy)
    });
  }

  ChatApp.prototype.receiveMessage = function(message)
  {
    var msg = JSON.parse(message);
    this.printMessage(msg);
  }

  ChatApp.prototype.printMessage = function(message)
  {
    console.log(message);
    var scrolled = this.isScrolledDown();
    var html = "<p><span class='chat-time'>["+timeStamp()+"] </span>";

    switch(message.type)
    {
      case "chat":
       html += "<span class='chat-name'>"+message.sender+"</span>: "
            +  "<span class='chat-text'>"+message.text+"</span></p>";
        break;
      case "status":
        html += "<span class='chat-status-name'>"+message.sender+"</span>"
             +  "<span class='chat-status-text'>"+message.text+"</span></p>";
        break;
    }

    this.output.append(html);

    if(scrolled)
      this.scrollDown();
  }

  ChatApp.prototype.isScrolledDown = function()
  {
    var div = this.output.get(0);

    if((div.clientHeight + div.scrollTop) == div.scrollHeight)
      return true;

    return false;
  }

  ChatApp.prototype.scrollDown = function()
  {
    var div = this.output.get(0);
    div.scrollTop = div.clientHeight+div.scrollTop;
  }

  ChatApp.prototype.renderClientList = function(list)
  {
    var scrolled = this.isScrolledDown();

    if(typeof list === 'undefined')
      var newList = this.clients;
    else
      var newList = list;

    var html = "";
    var count = 0;

    for(var key in newList){
      if(this.id == newList[key].id)
        html += "<li style='color: red'>"+newList[key].name+"</li>";  
      else
        html += "<li>"+newList[key].name+"</li>";
      count++;
    }
    pre = count + ((count > 1) ? " users " : " user ") + "connected: ";
    this.clientListDiv.html("<ul>"+pre+html+"</ul>");

    this.resizeChat();

    if(scrolled)
      this.scrollDown();
  }

  ChatApp.prototype.resizeChat = function()
  {
    var cLH = this.clientListDiv.outerHeight();
    var cH  = document.getElementById("chat-container").offsetHeight;
    var cIH = document.getElementById("chat-input-container").offsetHeight;
    this.output.css({
      "margin-top": cLH + 'px',
      "height": cH - cLH - cIH - 10 + 'px'
    });
  }

  ChatApp.prototype.addClient = function(client)
  {
    this.clients[client.id] = client;
  }

  ChatApp.prototype.updateClient = function(client)
  {
    var c = JSON.parse(client);
    this.printMessage({
      type: "status", 
      sender: this.clients[c.id].name, 
      text: " has changed name to <span class='chat-status-name'>"+c.name+"</span>"
    });
    this.clients[c.id] = c;
  }

  ChatApp.prototype.removeClient = function(id)
  {
    delete this.clients[id];
  }  

function Message(type, input, sender)
{
  this.type = type;
  this.text = input;
  this.sender = sender;
  this.timeStamp = timeStamp();
}