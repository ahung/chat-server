var socketIO = require("socket.io");

var createChat = function(server) {
  var socketServer = socketIO.listen(server);
  var currentUsers = {};
  var currentUserRooms = {};
  var rooms = [];

  socketServer.on("connection", function(socket) {
    function setUsername(username) {
      var response = {
        success: true
      };
      
      for (var i in currentUsers) {
        if (currentUsers[i] === username) {
          response.success = false;
          response.text = "Username Already Taken. Please Choose Another";
          socket.emit("notification", {message: response});
        }
      }
      
      if (response.success === true) {
        currentUsers[socket.id] = username;
        response.text = "Welcome, " + username + "! Enter /help to get started";
        socket.emit("set-username", {
          message: response,
          username: username
        });
      }
    }
    
    function joinRoom(room) {
      var currentRoom = currentUserRooms[socket.id];
      currentUserRooms[socket.id] = room;
      var response = {
        text: currentUsers[socket.id] + " has left the room."
      }
      if (currentRoom) {
        socketServer.sockets.in(currentRoom).emit("room-leave", {
          message: response
        });
      }
      socket.leave(currentRoom);
      if (socketServer.sockets.clients(currentRoom).length === 0) {
        var index = rooms.indexOf(currentRoom);
        rooms.splice(index, 1);
      }
      
      socket.join(room);
    }
    
    function listUsers(room) {
      var userList = [];
      
      for (var i in currentUserRooms) {
        if (currentUserRooms[i] === room) {
          userList.push(currentUsers[i]);
        }
      }
      
      socket.emit("user-list", {
        message: {},
        users: userList
      });
    }
    
    socket.on("new-message", function(data) {
      if (!(socket.id in currentUsers)) {
        var username = data.text;
        setUsername(username);
        
      } else if (!(socket.id in currentUserRooms)){
        response = {
          text: "Please join or create a room before sending messages"
        }
        socket.emit("notification", {message: response})
        
      } else {
        var room = currentUserRooms[socket.id];
        data.username = currentUsers[socket.id];
        socketServer.sockets.in(room).emit("post-message", {message: data});
      }
    });
    
    socket.on("list-rooms", function() {
      var roomsList = {};
      for (var i = 0; i < rooms.length; i++) {
        roomsList[rooms[i]] = socketServer.sockets.clients(rooms[i]).length;
      }
      socket.emit("room-list", {
        message: {},
        rooms: roomsList
      });
    })
    
    socket.on("new-room", function(data) {
      var newRoom = data.text;
      var response = {
        text: ""
      };
      
      if (rooms.indexOf(newRoom) != -1) {
        response.text = "Room already exists. Please Choose a Unique Name.";
        socket.emit("notification", {message: response});
        
      } else {
        rooms.push(newRoom);
        joinRoom(newRoom);
        response.text = "You've created: " + newRoom
        socket.emit("room-join", {
          message: response,
          room: newRoom
        });
      }
    })
    
    socket.on("join-room", function(data) {
      var room = data.text;
      var response = {
        text: ""
      };
      
      if (rooms.indexOf(room) != -1) {
        joinRoom(room);
        response.text = currentUsers[socket.id] + " has joined the room.";
        socketServer.sockets.in(room).emit("room-join", {
          message: response,
          room: room
        });
        listUsers(room);
        
      } else {
        response.text = "Room not found. List current rooms with /rooms";
          socket.emit("notification", {message: response});
      }
    })
    
    socket.on("list-users", function() {
      if (socket.id in currentUserRooms) {
        listUsers(currentUserRooms[socket.id]);
        
      } else {
        var response = {
          text: "Please join a room before trying to list users"
        };
        socket.emit("notification", {message: response});
      }
    })

    socket.on("leave-room", function() {
      if (socket.id in currentUserRooms) {
        var username = currentUsers[socket.id];
        var currentRoom = currentUserRooms[socket.id];
        var response = {
          text: username + " has left the room."
        };
        delete currentUserRooms[socket.id];
        socketServer.sockets.in(currentRoom).emit("room-leave", {
          message: response
        });
        socket.leave(currentRoom);
        
        if (socketServer.sockets.clients(currentRoom).length === 0) {
          var index = rooms.indexOf(currentRoom);
          rooms.splice(index, 1);
        }
        
      } else {
        var response = {
          text: "You aren't currently in a room!"
        };
        socket.emit("notification", {message: response});
      }
    })

    socket.on("disconnect", function() {
      var username = currentUsers[socket.id];
      var currentRoom = currentUserRooms[socket.id];
      if (socketServer.sockets.clients(currentRoom).length === 0) {
        var index = rooms.indexOf(currentRoom);
        rooms.splice(index, 1);
      } else {
        var response = {
          text: username + " has left the room."
        };
        socketServer.sockets.in(currentRoom).emit("notification", {
          message: response
        });
      }
      delete currentUserRooms[socket.id];
      delete currentUsers[socket.id];
      
      // socketServer.sockets.emit("disconnect", {message: message})
    })
  });
};

module.exports = createChat;
