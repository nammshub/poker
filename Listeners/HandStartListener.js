const EventEmitter = require( 'events' );
require('../config');
/**
 * Ce listener gere l'event start. Il doit stocker nos infos joueur pour la partie en cours et stocker le nbr de joueur de la partie
 */
class HandStartListener extends EventEmitter {
    handleMessage(startMessage,playerMemo) {
        playerMemo.listPlayers = startMessage.data.players;
        this.updateActiveAndPosition(playerMemo);
        //ajout d'un nouveau tour (vide pour le moment)
        playerMemo.totalHands++; 
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
                }
            }
            if (player.state && (player.state === 'ACTIVE' || player.state === 'ALL_IN' )){
                activeNbr++;
            }
          });
          playerMemo.nbJoueursActifs = activeNbr;
    }

}

module.exports = HandStartListener;