const EventEmitter = require( 'events' );
const NeuronalNetworkListener = require('./NeuronalNetworkListener');
/**
 * Ce listener gere l'event play. Il doit activer les calculs et repondre au croupier dans les temps impartis
 */
class PlayListener extends EventEmitter {
  

    static handleMessage(message,emmittingPlayer){
        
        //joueur courant a joue => OK
        if(emmittingPlayer.details.id === config.CURR_PLAYER.details.id){
            console.log('\n Le joueur courant (id = '+ emmittingPlayer.details.id +') a joue ');
            //on initialise sa mise à 0 si pas encore de mise pour ce joueur
            config.CURRENT_BETS.set(emmittingPlayer.details.id,config.CURRENT_BETS.get(emmittingPlayer.details.id)?config.CURRENT_BETS.get(emmittingPlayer.details.id):0);
            //on verifie que son action soit valide
            if(message.data.action.value === 0 ){
                if(config.CURRENT_MAX_BET > 0){
                //le joueur se couche
                emmittingPlayer.details.state = 'FOLDED';
                }
                config.CURR_PLAYER_VALID_ANSWER = true;
                clearTimeout(config.CURR_PLAYER_CHRONO);
                return true;
            }
            if(message.data.action.value === emmittingPlayer.details.chips){
                //le joueur fait ALL_IN
                emmittingPlayer.details.state = 'ALL_IN';
                emmittingPlayer.details.chips = 0;
                config.CURRENT_BETS.set(emmittingPlayer.details.id,config.CURRENT_BETS.get(emmittingPlayer.details.id)?config.CURRENT_BETS.get(emmittingPlayer.details.id):0 + message.data.action.value);
                config.CURRENT_BETS.set('POT',config.CURRENT_BETS.get('POT') + message.data.action.value);
                if(config.CURRENT_MAX_BET < message.data.action.value){
                    config.CURRENT_MAX_BET = message.data.action.value;
                }
                config.CURR_PLAYER_VALID_ANSWER = true;
                clearTimeout(config.CURR_PLAYER_CHRONO);
                return true;
            }
            if(message.data.action.value < emmittingPlayer.details.chips){
                //le joueur joue moins que la totalite de ses chips
                //on verifie qu'il joue au moins la mise max de la main
                if(message.data.action.value < config.CURRENT_MAX_BET){
                    //action invalide => le joueur est FOLDED
                    emmittingPlayer.details.state = 'FOLDED';
                    config.CURR_PLAYER_VALID_ANSWER = true;
                    clearTimeout(config.CURR_PLAYER_CHRONO);
                    return true;
                } else {

                }
                emmittingPlayer.details.state = 'ALL_IN';
                emmittingPlayer.details.chips = 0;
                config.CURRENT_BETS.set(emmittingPlayer.details.id,config.CURRENT_BETS.get(emmittingPlayer.details.id)?config.CURRENT_BETS.get(emmittingPlayer.details.id):0 + message.data.action);
                config.CURRENT_BETS.set('POT',config.CURRENT_BETS.get('POT') + message.data.action);
                config.CURR_PLAYER_VALID_ANSWER = true;
                clearTimeout(config.CURR_PLAYER_CHRONO);
                return true;
            }
        clearTimeout(config.CURR_PLAYER_CHRONO);
        config.CURR_PLAYER_VALID_ANSWER = true;
        return true;

        }
        //joueur imprevu a joue=> KO
        else{
            console.log('\n Le joueur courant (id = '+ emmittingPlayer.details.id +') a joue MAIS ce n est pas son tour !!');
        }
    }
}

module.exports = PlayListener;