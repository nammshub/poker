const EventEmitter = require( 'events' );
var game = require('../Beans/Game');
const NeuronalNetworkListener = require('./NeuronalNetworkListener');
/**
 * Ce listener gere l'event start. Il doit stocker nos infos joueur pour la partie en cours et stocker le nbr de joueur de la partie
 */
class PlayListener extends EventEmitter {
  

    handleMessage(playMessage,callback) {
        //game.hand = cardsMessage.data.cards;
        //config.NEURONAL_NETWORK_LISTENER.launchCompute( function(output){
        let messageJson = {
            'message' : 'toto is back'
        }
        callback(messageJson);
        //});
        console.log('object game contains' + JSON.stringify(game));
    }
}

module.exports = PlayListener;