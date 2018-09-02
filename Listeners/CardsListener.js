const EventEmitter = require( 'events' );
var game = require('../Beans/Game');
require('../config');

/**
 * Ce listener gere l'event cards. Il doit stocker nos cartes du tour
 */
class CardsListener extends EventEmitter {
    handleMessage(cardsMessage) {
        game.hand = cardsMessage.data.cards;
        const tourNumber = game.turnsDetails.length;
        config.NEURONAL_NETWORK_LISTENER.launchCompute( function(output){
            //game
            console.log('after response from NEURONAL_NETWORK_LISTENER.launchCompute = ' + output);
        });
        console.log('inside CardsListener');
    }
}

module.exports = CardsListener;