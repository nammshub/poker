const net = require("net");
require("./config");
require("./neuronalMemory")
const TCPListener = require("./Listeners/TCPListener");
const NeuronalNetworkListener = require("./Listeners/NeuronalNetworkListener");
const brain = require("brain.js");

const tcpListener = new TCPListener();
const HOST = config.HOST;
const PORT = config.PORT;

const neurone = new brain.NeuralNetwork();
//on recupere une copie du tableau des datas neuronales
const neuronalArray = NEURONAL.slice(0);
const before = new Date();
console.log('before train = '+before.toLocaleTimeString);
neurone.train(neuronalArray);
const after = new Date();
console.log('after train = '+after.toLocaleTimeString);

const playerSocket = new net.Socket();
let playerMemo = {
    "player": "",
    "nbJoueursActifs": 0,
    "potTotal": 0,
    "turnPosition": 0,
    "hand": [],
    "totalHands": 0,
    "listPlayers": [],
    "turnsDetails": [
        //infos detaillées sur chaque tour
        {
            "tourNumber": 0,
            //cet iterateur garde en memoire le numero de l"action en cours. Chaque fois qu"un joueur joue cela augmente de 1 (CALL ou FOLD)
            "actionNbrIter": 0,
            //tapis: liste des cartes sur le tapis
            "tapis": [
                //carte1, carte2...
            ],
            "neuronalResponses": [],
            "randomResponse": 0
        }
    ]
}
playerSocket.connect(PORT, HOST, function () {

    let teamName = "D.E.V. team";

    process.argv.forEach((val, index) => {
        if (index === 2)
            teamName = val;
    });

    console.log("CONNECTED TO: " + HOST + ":" + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    const suscribeMessage = {
        "id": "client.lobby.join",
        "data": {
            "name": teamName
        }
    }
    playerSocket.write(JSON.stringify(suscribeMessage));
});

// Add a "data" event handler for the client socket
// data is what the server sent to this socket
playerSocket.on("data", function (data) {
    tcpListener.handleTCPData(data, playerMemo, neurone, function (response) {
        playerSocket.write(JSON.stringify(response));
    });
});

// Add a "close" event handler for the client socket
playerSocket.on("close", function () {
    console.log("Connection closed");
});