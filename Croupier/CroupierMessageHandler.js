const EventEmitter = require('events');
const PlayerPlayedListener = require('../Listeners/PlayerPlayedListener');
const LobbyJoinListener = require('../Listeners/LobbyJoinListener');
require('../config');

class CroupierMessageHandler extends EventEmitter {
    static handleData(data,socket) {
        const message = JSON.parse(data);
        const emmittingPlayer = this.getPlayerBySocket(socket);
        switch (message.id) {
            case 'player.action':
                console.log('Le joueur '+ emmittingPlayer.details.id +' a joue !');
                PlayerPlayedListener.handleMessage(message,emmittingPlayer,this);
                break;
            case 'client.lobby.join':
                console.log('Le joueur '+ emmittingPlayer.details.id +' rejoint le lobby !');
                LobbyJoinListener.handleMessage(message,emmittingPlayer);
                break;
            default:
                console.log('message envoye de nature inconnue '+data)
                break;
        }
    }

    // Send a message to all clients
    static broadcast(message, sender) {
        config.PLAYERS.forEach(function (player) {
            // Don't want to send it to sender
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
    static getPlayerBySocket(socket){
        let iter;
        for (iter in config.PLAYERS){
            if(config.PLAYERS[iter].socket === socket){
                return config.PLAYERS[iter];
            }
        }
        return null;
    }
}

module.exports = CroupierMessageHandler;