const net = require('net');
require('./config');
const TCPListener = require('./Listeners/TCPListener');
const NeuronalNetworkListener = require('./Listeners/NeuronalNetworkListener');
const brain = require('brain.js');

const tcpListener = new TCPListener();
const HOST = config.HOST;
const PORT = config.PORT;
config.NEURONAL_NETWORK = new brain.NeuralNetwork();
config.NEURONAL_NETWORK_LISTENER = new NeuronalNetworkListener();
config.NEURONAL_NETWORK_HELPER = new 

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {
    
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    
    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        tcpListener.handleTCPData(data);
    });

    //le joueur signale au ceoupier qu'il veut jouer
    const suscribeJSON = {
        "id" : "player.suscribe"
    };
    sock.write(JSON.stringify(suscribeJSON));
    /*
    sock.on('data', function(data) {
        
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        // Write the data back to the socket, the client will receive it as data from the server
        sock.write('You said "' + data + '"');
        
    });
    
    
    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    */
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);