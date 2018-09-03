/**
 * Cette classe main lance une partie.
 * Attend que les joueurs se connectent pendant  minute ensuite lance les tours jusqu' a ce qu'il y aie un gagnant ou que  tours soient passés
 */

var net = require("net");
require('../config');
const CroupierMessageHandler = require('./CroupierMessageHandler');
const HOST = config.HOST;
const PORT = config.PORT;
const croupierMessageHandler = new CroupierMessageHandler();

// Keep track of the players
let players = [];

// Start a TCP Server
net.createServer(function (socket) {

  // Identify this client
  socket.position = players.length + 1;
  socket.name = "Player"+socket.position;

  // Put this new player in the list
  players.push(socket);

  // Send a nice welcome message and announce
  console.log("Welcome " + socket.name + "\n");

  // Handle incoming messages from clients.
  socket.on('data', function (data) {
    croupierMessageHandler.handleData(data);
  });

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.name + " left the chat.\n");
  });

  // Remove the client from the list when it leaves
  socket.on('error', function (data) {
   console.log('Exception : ' + data);
  });
  
  // Send a message to all clients
  function broadcast(message, sender) {
    clients.forEach(function (client) {
      // Don't want to send it to sender
      if (client === sender) return;
      client.write(message);
    });
    // Log it to the server output too
    process.stdout.write(message)
  }

}).listen(PORT);

// Put a friendly message on the terminal of the server.
console.log("Chat server running at port "+PORT+"\n");