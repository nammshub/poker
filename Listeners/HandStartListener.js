const EventEmitter = require( 'events' );
var game = require('../Beans/Game');
/**
 * Ce listener gere l'event start. Il doit stocker nos infos joueur pour la partie en cours et stocker le nbr de joueur de la partie
 */
class HandStartListener extends EventEmitter {
    handleMessage(startMessage) {
        game.listPlayers = startMessage.data.players;
        this.updateActiveAndPosition();
        //ajout d'un nouveau tour (vide pour le moment)
        game.totalHands++; 
        game.turnsDetails.push({
            'tourNumber' :game.totalHands,
            'actionNbrIter' :0,
            'tapis' : [
                //carte1, carte2...
            ],
            'neuronalResponses' : [],
            'randomResponse' : 0
        });
        console.log('object game contains' + JSON.stringify(game));
    }

    updateActiveAndPosition(){
        let activeNbr = 0;
        let position = 0;
        let posFound = false;
        game.listPlayers.forEach(function(player) {
            if(!posFound){
                position++;
                if(game.player.id === player.id){
                    game.turnPosition = position;
                    posFound = true;
                }
            }
            if (player.state && (player.state === 'ACTIVE' || player.state === 'ALL_IN' )){
                activeNbr++;
            }
          });
        game.nbJoueursActifs = activeNbr;
    }

}

module.exports = HandStartListener;