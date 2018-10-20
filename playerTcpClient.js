const net = require("net");
require("./config");
require("./neuronalMemory")
const TCPListener = require("./Listeners/TCPListener");
const NeuronalNetworkListener = require("./Listeners/NeuronalNetworkListener");
const brain = require("brain.js");

const tcpListener = new TCPListener();
const HOST = config.HOST;
const PORT = config.PORT;
/*
net.train(data, {
                            // Defaults values --> expected validation
      iterations: 20000,    // the maximum times to iterate the training data --> number greater than 0
      errorThresh: 0.005,   // the acceptable error percentage from training data --> number between 0 and 1
      log: false,           // true to use console.log, when a function is supplied it is used --> Either true or a function
      logPeriod: 10,        // iterations between logging out --> number greater than 0
      learningRate: 0.3,    // scales with delta to effect training rate --> number between 0 and 1
      momentum: 0.1,        // scales with next layer's change value --> number between 0 and 1
      callback: null,       // a periodic call back that can be triggered while training --> null or function
      callbackPeriod: 10,   // the number of iterations through the training data between callback calls --> number greater than 0
      timeout: Infinity     // the max number of milliseconds to train for --> number greater than 0
});
*/
const neurone = new brain.NeuralNetwork();
//on recupere une copie du tableau des datas neuronales
const neuronalArray = NEURONAL.slice(0);
const before = new Date();
console.log('before train = ' + before);
neurone.train(neuronalArray, { log: true });
const after = new Date();
console.log('after train = ' + after);
const logFile = "./Logs/" + after.getTime() + ".log";

//PAUSE jusqu'a ce que user clic une touche

var stdin = process.openStdin();



stdin.addListener("data", function () {
    const playerSocket = new net.Socket();
    let playerMemo = {
        "logFile": logFile,
        "player": "",
        "potTotal": 0,
        "hand": [],
        "totalHands": 0,
        "listPlayers": [],
        "turnsDetails": [
            //infos detaillées sur chaque tour
            {
                "chipsEndTurn": 0,
                "tourNumber": 0,
                //tapis: liste des cartes sur le tapis
                "tapis": [
                    //carte1, carte2...
                ],
                "neuronalResponses": 0,
                "randomResponse": 0,
                "neuronalInput": {
                    "input": {
                        "h1": 0.2692307692307692,
                        "h2": 0.5384615384615384,
                        "p1_a1": 0.006,
                        "p2_a1": 0.006,
                        "g": 0.5
                    },
                    "output": {
                        "chips": 0
                    }
                }
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
});