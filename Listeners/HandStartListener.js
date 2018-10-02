const EventEmitter = require( 'events' );
const BlindHelper = require('../Helpers/BlindHelper');

require('../config');
/**
 * Ce listener gere l'event start. Il doit stocker nos infos joueur pour la partie en cours et stocker le nbr de joueur de la partie
 */
class HandStartListener extends EventEmitter {
    handleMessage(startMessage,playerMemo) {
        playerMemo.listPlayers = startMessage.data.players;
        this.updateActiveAndPosition(playerMemo);
        //Maj des chips si le corupier a pris une blinde chez le joueur
        for(let player of startMessage.data.players){
            if(playerMemo.player.id === player.id){
                playerMemo.player = player;
            }
        }
        //ajout d'un nouveau tour (vide pour le moment)
        playerMemo.totalHands++; 
        //actualise les blindes
        const currBlinds = BlindHelper.actualizeBlinds(playerMemo.totalHands);
        playerMemo.bigBlind = currBlinds[1];
        playerMemo.turnsDetails.push({
            'tourNumber' :playerMemo.totalHands,
            'actionNbrIter' :0,
            'tapis' : [
                //carte1, carte2...
            ],
            'neuronalResponses' : [],
            'randomResponse' : 0
        });
        console.log('\n Hand Start event. playerMemo = ' + JSON.stringify(playerMemo));
    }

    updateActiveAndPosition(playerMemo){
        let activeNbr = 0;
        let position = 0;
        let posFound = false;
        playerMemo.listPlayers.forEach(function(player) {
            if(!posFound){
                position++;
                if(playerMemo.player.id === player.id){
                    playerMemo.turnPosition = position;
                    posFound = true;
                    playerMemo.player.chips
                }
            }
            if (player.state && (player.state === 'ACTIVE')){
                activeNbr++;
            }
          });
          playerMemo.nbJoueursActifs = activeNbr;
    }

}

module.exports = HandStartListener;