const net = require("net");
require("./config");
require("./neuronalMemory")
const TCPListener = require("./Listeners/TCPListener");
const NetworkTrainingHelper = require("./Helpers/NetworkTrainingHelper");
const fs = require('fs');
const brain = require("brain.js");

const tcpListener = new TCPListener();
const HOST = config.HOST;
const PORT = config.PORT;

let neurone = new brain.NeuralNetwork({
    activation: config.ACTIVATION_FUNCTION, 
    hiddenLayers: config.HIDDEN_LAYERS,
});
if (config.TRAINING_NEEDED) {
    //on recupere une copie du tableau des datas neuronales
    const neuronalArray = NEURONAL.slice(0);
    NetworkTrainingHelper.trainNetwork(neurone, neuronalArray, "trained-network.json");
}
const logName = new Date();
const logFile = "./Logs/" + logName.getTime() + ".log";
//creation du reseau à partir du trained-network.json
jsonTrainedNetwork = JSON.parse(fs.readFileSync("trained-network.json", "utf8"));
neurone.fromJSON(jsonTrainedNetwork);
//console.log("network ready to work !!");

//PAUSE jusqu'a ce que user clic une touche
//let stdin = process.openStdin();
//stdin.addListener("data", function () {
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

        //console.log("CONNECTED TO: " + HOST + ":" + PORT);
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
    playerSocket.on("error", function (error) {
        console.log("Error :" + error.message);
    });
//});