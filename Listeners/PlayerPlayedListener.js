const EventEmitter = require( 'events' );
const NeuronalNetworkListener = require('./NeuronalNetworkListener');
/**
 * Ce listener gere l'event play. Il doit activer les calculs et repondre au croupier dans les temps impartis
 */
class PlayerPlayedListener extends EventEmitter {
  

    static handleMessage(message,emmittingPlayer){
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
        if(emmittingPlayer.details.id !== config.CURR_PLAYER.details.id){
            console.log('\n Le joueur avec (id = '+ emmittingPlayer.details.id +') a joue MAIS ce n est pas son tour !!');
            config.PLAYERS.every(function (player){
                if(player.details.id === emmittingPlayer.details.id){
                    player.details.state = 'FOLDED';
                    return true;
                }
            })
        }
        //joueur joue moins que 0 => KO
        if(message.data.action.value < 0 ){
            console.log('\n Le joueur avec (id = '+ emmittingPlayer.details.id +') a misé moins que 0 chips !!');
            config.PLAYERS.every(function (player){
                if(player.details.id === emmittingPlayer.details.id){
                    player.details.state = 'FOLDED';
                    return true;
                }
            })
        }

        //joueur joue plus que ses chips restants => KO
        if(message.data.action.value > 0 ){
            console.log('\n Le joueur avec (id = '+ emmittingPlayer.details.id +') a misé moins que 0 chips !!');
            config.PLAYERS.every(function (player){
                if(player.details.id === emmittingPlayer.details.id){
                    player.details.state = 'FOLDED';
                    return true;
                }
            })
        }



        //joueur courant a joue => OK
            console.log('\n Le joueur courant (id = '+ emmittingPlayer.details.id +') a joue ');
            //on initialise sa mise à 0 si pas encore de mise pour ce joueur
            config.CURRENT_BETS.set(emmittingPlayer.details.id,config.CURRENT_BETS.get(emmittingPlayer.details.id)?config.CURRENT_BETS.get(emmittingPlayer.details.id):0);
            //on verifie que son action soit valide
            if(message.data.action.value === 0 ){
                if(config.CURRENT_MAX_BET > 0){
                //le joueur se couche
                emmittingPlayer.details.state = 'FOLDED';
                }
            }
            if(message.data.action.value === emmittingPlayer.details.chips){
                //le joueur fait ALL_IN
                emmittingPlayer.details.state = 'ALL_IN';
                emmittingPlayer.details.chips = 0;
                config.CURRENT_BETS.set(emmittingPlayer.details.id,config.CURRENT_BETS.get(emmittingPlayer.details.id)?config.CURRENT_BETS.get(emmittingPlayer.details.id):0 + message.data.action.value);
                config.CURRENT_BETS.set('POT',config.CURRENT_BETS.get('POT') + message.data.action.value);
                if(config.CURRENT_MAX_BET < config.CURRENT_BETS.get(emmittingPlayer.details.id)){
                    config.CURRENT_MAX_BET = config.CURRENT_BETS.get(emmittingPlayer.details.id);
                }
            }
            if(message.data.action.value < emmittingPlayer.details.chips){
                //le joueur joue moins que la totalite de ses chips
                //on verifie qu'il joue au moins la mise max de la main
                if(config.CURRENT_BETS.get(emmittingPlayer.details.id) + message.data.action.value < config.CURRENT_MAX_BET){
                    //action invalide => le joueur est FOLDED
                    emmittingPlayer.details.state = 'FOLDED';
                } else {

                }
                emmittingPlayer.details.state = 'ALL_IN';
                emmittingPlayer.details.chips = 0;
                config.CURRENT_BETS.set(emmittingPlayer.details.id,config.CURRENT_BETS.get(emmittingPlayer.details.id)?config.CURRENT_BETS.get(emmittingPlayer.details.id):0 + message.data.action);
                config.CURRENT_BETS.set('POT',config.CURRENT_BETS.get('POT') + message.data.action);
            }
        clearTimeout(config.CURR_PLAYER_CHRONO);
        config.CURR_PLAYER_VALID_ANSWER = true;
        return true;
        
        
    }
}

module.exports = PlayerPlayedListener;
