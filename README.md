Chat Server
===========
Basic Chat App built using node.js and socket.io  
  
Commands: 
  * /rooms - list all active rooms
  * /join roomname - join specified room (if it exists)
  * /new roomname - create specified room (if it doesn't already exist)
  * /users - list all users in the current room
  * /leave - leave the current room
  * /quit - leaves the current room (if in one) and disconnects from the chat server
  * /help - lists all the above commands
 
Features:
  * Choose unique username to begin
  * Currently, only be active in one room
  * Shows current room you're in and your username
  * Usernames in front of messages
  * Notifications of users joining and leaving
  * Prevent sending the message if text is blank or just whitespace
  * Prevent user from using commands if a username hasn't been chosen yet
