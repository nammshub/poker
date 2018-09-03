const net = require('net');
require('./config');
const TCPListener = require('./Listeners/TCPListener');
const NeuronalNetworkListener = require('./Listeners/NeuronalNetworkListener');
const brain = require('brain.js');

const tcpListener = new TCPListener();
const HOST = config.HOST;
const PORT = config.PORT;

const playerSocket = new net.Socket();
playerSocket.connect(PORT, HOST, function() {

    console.log("CONNECTED TO: " + HOST + ":" + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    const suscribeMessage = {
        "data" : "I want to play poker !"
    }
    playerSocket.write(JSON.stringify(suscribeMessage));
});

// Add a "data" event handler for the client socket
// data is what the server sent to this socket
playerSocket.on("data", function(data) {
    tcpListener.handleTCPData(data, function(response){
        playerSocket.write(JSON.stringify(response));
    });
});

// Add a "close" event handler for the client socket
playerSocket.on("close", function() {
    console.log("Connection closed");
});