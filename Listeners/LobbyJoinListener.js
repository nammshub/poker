const EventEmitter = require( "events" );
const NeuronalNetworkListener = require("./NeuronalNetworkListener");
/**
 * Ce listener gere la venue dans le lobby. Il verifie que le nom d"equipe ne soit pas deja pris
 */
class LobbyJoinListener extends EventEmitter {
  

    static handleMessage(message,emmittingPlayer){
        for (let player of config.PLAYERS){
            if(player.details.name === message.data.name){
                //nom existe deja
                const lobbyJoinFailure = {
                    "id": "server.lobby.join.failure",
                    "data": {
                      "reason": "team name ("+message.data.name+") already taken"
                    }
                  }
                  emmittingPlayer.socket.write(JSON.stringify(lobbyJoinFailure));
                  return;
            }
        };
        //sinon on ecrit un lobyyJoinsucces et on assigne ce nom au joueur
        for (let player of config.PLAYERS){
            //console.log("begin lobbyjoinlistener : emmittingPlayer id = "+emmittingPlayer.details.id)
            //console.log("begin lobbyjoinlistener : player id = "+player.details.id)
            //console.log("begin lobbyjoinlistener : config.PLAYERS.length = "+config.PLAYERS.length)

            if(player.details.id === emmittingPlayer.details.id){
                player.details.name = message.data.name;
                const lobbyJoinSuccess = {
                    "id": "server.lobby.join.success"
                  };
                  emmittingPlayer.socket.write(JSON.stringify(lobbyJoinSuccess));
                  return;
            }
        };
        
    }
}

module.exports = LobbyJoinListener;
