var http = require("http");
var fs = require("fs");
var nodeStatic = require("node-static");
var createChat   = require("./lib/chat_server");
var staticServer = new nodeStatic.Server("./public");

var server = http.createServer(function (request, response) {
  staticServer.serve(request, response);
});

createChat(server);

server.listen(process.env.PORT || 8080);
console.log("Chat Server Running on Port 8080");


