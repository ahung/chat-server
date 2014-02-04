(function(root) {
  var ChatApp = root.ChatApp = (root.ChatApp || {});
  var socket = io.connect();
  var chat = new ChatApp.Chat(socket);

  ChatApp.processCommand = function(text) {
    var command = text.split(" ", 1);
    var chatLine = $('<p>');
    var newMessage = $('<i>');
    if (command[0].toLowerCase() == "/rooms") {
      chat.socket.emit("list-rooms");
      
    } else if (command[0].toLowerCase() == "/join") {
      var room = text.substr(6);
      chat.socket.emit("join-room", {text: room});
      
    } else if (command[0].toLowerCase() == "/new") {
      var room = text.substr(5);
      chat.socket.emit("new-room", {text: room});
      
    } else if (command[0].toLowerCase() == "/leave") {
      chat.socket.emit("leave-room");
      
    } else if (command[0].toLowerCase() == "/quit") {
      newMessage.text("You are now disconnected, reload page to reconnect");
      chatLine.append(newMessage);
      $("#messages").append(chatLine);
      $("#current-room").text('');
      $("#username").text('');
      $("#message-form").hide();
      chat.socket.disconnect();
      
    } else if (command[0].toLowerCase() == "/users") {
      chat.socket.emit("list-users");
      
    } else if (command[0].toLowerCase() == "/help") {
      var commandList = ["Commands:", "/rooms", "/join roomname", 
      "/new roomname", "/users", "/leave", "/quit", "----"];
      
      for (var i = 0; i < commandList.length; i++) {
        var chatLine = $('<p>');
        var newMessage = $('<i>');
        newMessage.text(commandList[i]);
        chatLine.append(newMessage);
        $("#messages").append(chatLine);
      }
      
    } else {
      newMessage.text("Unknown Command. Use /help for a list of commands");
      chatLine.append(newMessage);
      $("#messages").append(chatLine);
    }
    $('#message-area').scrollTop($('#message-area')[0].scrollHeight);
  };

  ChatApp.buildChatLine = function(data) {
    var chatLine = $('<p>');
    var newMessage = $('<i>');
    newMessage.text(data.message.text);
    chatLine.append(newMessage)
    $("#messages").append(chatLine);
    $('#message-area').scrollTop($('#message-area')[0].scrollHeight);
  };

  $(function() {
    $('#message-form').submit( function(event) {
      event.preventDefault();
      var text = $(event.currentTarget).find("#message-text").val();
      $(event.currentTarget).find("#message-text").val("");
      if (text[0] === '/') {
        ChatApp.processCommand(text);
      } else {
        chat.sendMessage(text);
      }
    });

    chat.socket.on("set-username", function(data) {
      var username = data.username;
      $("#current-room").text("Currently not in a room");
      $("#username").text("Logged in as: " + username);
      ChatApp.buildChatLine(data);
    })
    
    chat.socket.on("post-message", function(data) {
      var chatLine = $("<p>");
      var newMessage = $("<span>");
      var username = $("<b>");
      username.text(data.message.username + ": ");
      newMessage.text(data.message.text);
      chatLine.append(username).append(newMessage);
      $("#messages").append(chatLine);
      $('#message-area').scrollTop($('#message-area')[0].scrollHeight);
    });

    chat.socket.on("notification", function(data) {
      ChatApp.buildChatLine(data);
    })
    
    chat.socket.on("room-list", function(data) {
      data.message.text = "Currently Active Rooms:";
      ChatApp.buildChatLine(data);
      for (var i in data.rooms) {
        data.message.text = "* " + i + " (" + data.rooms[i] + ")";
        ChatApp.buildChatLine(data);
      }
      data.message.text = "----";
      ChatApp.buildChatLine(data);
    })
    
    chat.socket.on("user-list", function(data) {
      data.message.text = "Current Users in This Room";
      ChatApp.buildChatLine(data);
      for (var i = 0; i < data.users.length; i++) {
        data.message.text = "- " + data.users[i];
        ChatApp.buildChatLine(data);
      }
      data.message.text = "----";
      ChatApp.buildChatLine(data);
    })
    
    chat.socket.on("room-join", function (data) {
      var room = data.room;
      $("#current-room").text("Currently in: " + room);
      ChatApp.buildChatLine(data);
    })
    
    chat.socket.on("room-leave", function (data) {
      $("#current-room").text("Currently not in a room");
      ChatApp.buildChatLine(data);
    })
  });
})(this);

