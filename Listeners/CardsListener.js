const EventEmitter = require( 'events' );
require('../config');

/**
 * Ce listener gere l'event cards. Il doit stocker nos cartes du tour
 */
class CardsListener extends EventEmitter {
    handleMessage(cardsMessage, playerMemo) {
        playerMemo.hand = cardsMessage.data.cards;
        /*config.NEURONAL_NETWORK_LISTENER.launchCompute( function(output){
            //game
            console.log('after response from NEURONAL_NETWORK_LISTENER.launchCompute = ' + output);
        });*/
        console.log('inside CardsListener game = '+JSON.stringify(playerMemo));
    }
}

module.exports = CardsListener;