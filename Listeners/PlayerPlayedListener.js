const EventEmitter = require("events");
//const CroupierMessageHandler = require("../Croupier/CroupierMessageHandler");
const NeuronalNetworkListener = require("./NeuronalNetworkListener");
/**
 * Ce listener gere l"event play. Il doit activer les calculs et repondre au croupier dans les temps impartis
 */
class PlayerPlayedListener extends EventEmitter {

    static sendValidSignal() {
        clearTimeout(config.CURR_PLAYER_CHRONO);
        config.CURR_PLAYER_VALID_ANSWER = true;
    }


    static handleMessage(message, emmittingPlayer, CroupierMessageHandler) {
        let playerAction = {
            "id": "server.player.action",
            "data": {
            "id": emmittingPlayer.details.id,
            "action": {
                "value": 0
                }
            }
        }
        /*
        arbre decision:

        joueur non en cour joue => erreur


        joue < 0 => erreur
        joue plus que chips restant => erreur
        joue chips restant => all in
                
                
        max mise == 0
                joue 0 => check
                joue 0 < < chips restant => raise
                
                
        max mise > 0
                joue 0 => FOLD
                joue max mise => check
                joue max mise < < chips restant => raise

        */

        //joueur imprevu a joue=> KO
        if (emmittingPlayer.details.id !== config.CURR_PLAYER.details.id) {
            console.log("\n Le joueur avec (id = " + emmittingPlayer.details.id + ") a joue MAIS ce n est pas son tour !!");
            for( let player of config.PLAYERS){
                if (player.details.id === emmittingPlayer.details.id) {
                    player.details.state = "FOLDED";
                    return true;
                }
            }
        }

        //on initialise la bet du joueur en cours si pas deja fait
        config.CURRENT_BETS.set(emmittingPlayer.details.id, config.CURRENT_BETS.get(emmittingPlayer.details.id) ? config.CURRENT_BETS.get(emmittingPlayer.details.id) : 0);

        //joueur joue plus que ses chips restants => KO
        if (message.data.action.value > emmittingPlayer.details.chips) {
            console.log("\n Le joueur avec (id = " + emmittingPlayer.details.id + ") a misé plus que ses chips restants !!");
            //throw Error(" Le joueur avec l'id " + emmittingPlayer.details.id +" a mise " + message.data.action.value +" mais ne possede que " + emmittingPlayer.details.chips);
            for( let player of config.PLAYERS){
                                if (player.details.id === emmittingPlayer.details.id) {
                    player.details.state = "FOLDED";
                    PlayerPlayedListener.sendValidSignal();
                    CroupierMessageHandler.broadcast(JSON.stringify(playerAction),emmittingPlayer);
                    return true;
                }
            }
        }

        //joueur joue all-in
        if (message.data.action.value === emmittingPlayer.details.chips) {
            console.log("\n Le joueur avec (id = " + emmittingPlayer.details.id + ") joue all-in !!");
            for( let player of config.PLAYERS){
                if (player.details.id === emmittingPlayer.details.id) {
                    player.details.chips = 0;
                    config.CURRENT_BETS.set("POT", config.CURRENT_BETS.get("POT") + message.data.action.value);
                    config.CURRENT_BETS.set(emmittingPlayer.details.id, config.CURRENT_BETS.get(emmittingPlayer.details.id) + message.data.action.value);

                    if (config.CURRENT_MAX_BET < config.CURRENT_BETS.get(emmittingPlayer.details.id)) {
                        config.CURRENT_MAX_BET = config.CURRENT_BETS.get(emmittingPlayer.details.id);
                    }
                    PlayerPlayedListener.sendValidSignal();
                    playerAction.data.action.value = message.data.action.value;
                    CroupierMessageHandler.broadcast(JSON.stringify(playerAction),emmittingPlayer);
                    return true;
                }
            }
        }

        //joueur joue moins que max bet => KO
        if (message.data.action.value + config.CURRENT_BETS.get(emmittingPlayer.details.id) < config.CURRENT_MAX_BET) {
            console.log("\n Le joueur avec (id = " + emmittingPlayer.details.id + ") a misé moins que la max bet (" + config.CURRENT_MAX_BET + ") !!");
            for( let player of config.PLAYERS){
                if (player.details.id === emmittingPlayer.details.id) {
                    player.details.state = "FOLDED";
                    PlayerPlayedListener.sendValidSignal();
                    CroupierMessageHandler.broadcast(JSON.stringify(playerAction),emmittingPlayer);
                    return true;
                }
            }
        }

        //joueur check
        if (message.data.action.value + config.CURRENT_BETS.get(emmittingPlayer.details.id) === config.CURRENT_MAX_BET) {
            console.log("\n Le joueur avec (id = " + emmittingPlayer.details.id + ") => CHECK");
            for( let player of config.PLAYERS){
                if (player.details.id === emmittingPlayer.details.id) {
                    player.details.chips = player.details.chips - message.data.action.value;
                    config.CURRENT_BETS.set("POT", config.CURRENT_BETS.get("POT") + message.data.action.value);
                    config.CURRENT_BETS.set(emmittingPlayer.details.id, config.CURRENT_BETS.get(emmittingPlayer.details.id) + message.data.action.value);
                    PlayerPlayedListener.sendValidSignal();
                    playerAction.data.action.value = message.data.action.value;
                    CroupierMessageHandler.broadcast(JSON.stringify(playerAction),emmittingPlayer);
                    return true;
                }
            }
        }

        //joueur raise
        if (message.data.action.value + config.CURRENT_BETS.get(emmittingPlayer.details.id) > config.CURRENT_MAX_BET) {
            for( let player of config.PLAYERS){
                if (player.details.id === emmittingPlayer.details.id) {
                    player.details.chips = player.details.chips - message.data.action.value;
                    config.CURRENT_BETS.set("POT", config.CURRENT_BETS.get("POT") + message.data.action.value);
                    config.CURRENT_BETS.set(emmittingPlayer.details.id, config.CURRENT_BETS.get(emmittingPlayer.details.id) + message.data.action.value);
                    config.CURRENT_MAX_BET = config.CURRENT_BETS.get(emmittingPlayer.details.id);
                    console.log("\n Le joueur avec (id = " + emmittingPlayer.details.id + ") a RAISE !! la max bet (" + config.CURRENT_MAX_BET + ") ");
                    PlayerPlayedListener.sendValidSignal();
                    playerAction.data.action.value = message.data.action.value;
                    CroupierMessageHandler.broadcast(JSON.stringify(playerAction),emmittingPlayer);
                    return true;
                }
            }
        }
    }
}



module.exports = PlayerPlayedListener;
