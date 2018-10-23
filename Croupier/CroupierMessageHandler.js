const EventEmitter = require("events");
const PlayerPlayedListener = require("../Listeners/PlayerPlayedListener");
const LobbyJoinListener = require("../Listeners/LobbyJoinListener");
require("../config");

class CroupierMessageHandler extends EventEmitter {
    static handleData(data, socket) {
        const message = JSON.parse(data);
        const emmittingPlayer = this.getPlayerBySocket(socket);
        switch (message.id) {
            case "client.game.player.play":
                console.log("Le joueur " + emmittingPlayer.details.id + " a joue !");
                PlayerPlayedListener.handleMessage(message, emmittingPlayer, this);
                break;
            case "client.lobby.join":
                console.log("Le joueur " + emmittingPlayer.details.id + " rejoint le lobby !");
                LobbyJoinListener.handleMessage(message, emmittingPlayer);
                break;
            default:
                console.log("message envoye de nature inconnue " + data)
                break;
        }
    }

    static handleWinnerMap(winnerMap) {
        //pour chaque winner, on augmente ses chips et ensuite on l'ajoute dans le tableau des winners qu'on va broadcast
        let winnerArray = [];
        winnerMap.forEach(function (chips, playerId) {
            config.PLAYERS.forEach(function (player) {
                if (player.details.id === playerId) {
                    player.details.chips += chips;
                    winnerArray.push(player.details);
                }
            })
        })
        //on broadcast les winners
        let handEndMessage = {
            "id": "server.game.hand.end",
            "data": {
                "winners": winnerArray
            }
        }
        this.broadcast(JSON.stringify(handEndMessage));
    }

    // Send a message to all clients
    static broadcast(message, sender) {
        config.PLAYERS.forEach(function (player) {
            // Don"t want to send it to sender
            if (player === sender) return;
            player.socket.write(message);
        });
        // Log it to the server output too
        //process.stdout.write(message)
    }

    /**
     * retourne le joueur lié au socket en param
     * @param {*} socket 
     */
    static getPlayerBySocket(socket) {
        let iter;
        for (iter in config.PLAYERS) {
            if (config.PLAYERS[iter].socket === socket) {
                return config.PLAYERS[iter];
            }
        }
        return null;
    }
}

module.exports = CroupierMessageHandler;