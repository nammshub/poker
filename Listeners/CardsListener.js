const EventEmitter = require( 'events' );
require('../config');

/**
 * Ce listener gere l'event cards. Il doit stocker nos cartes du tour
 */
class CardsListener extends EventEmitter {
    handleMessage(cardsMessage, playerMemo) {
        playerMemo.hand = cardsMessage.data.cards;
        //tri croissant selon cardInput
        playerMemo.hand.sort(this.compare);
        this.cardsToNeuronalInput(playerMemo)
        /*config.NEURONAL_NETWORK_LISTENER.launchCompute( function(output){
            //game
            console.log('after response from NEURONAL_NETWORK_LISTENER.launchCompute = ' + output);
        });*/
        console.log('inside CardsListener game = '+JSON.stringify(playerMemo));
    }

    cardsToNeuronalInput(playerMemo){
        playerMemo.turnsDetails[playerMemo.totalHands].h1 = playerMemo.hand[0].cardInput;
        playerMemo.turnsDetails[playerMemo.totalHands].h2 = playerMemo.hand[1].cardInput;
    }

    compare(a,b) {
        if (a.cardInput < b.cardInput)
          return -1;
        if (a.cardInput > b.cardInput)
          return 1;
        return 0;
      }
}

module.exports = CardsListener;