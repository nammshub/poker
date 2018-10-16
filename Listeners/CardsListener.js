const EventEmitter = require( "events" );
require("../config");
const DeckHelper = require("../Helpers/DeckHelper");

/**
 * Ce listener gere l"event cards. Il doit stocker nos cartes du tour
 */
class CardsListener extends EventEmitter {
    handleMessage(cardsMessage, playerMemo) {
        //on injecte le cardInput dans chaque carte recue
        cardsMessage.data.cards.forEach(function (card){
            card.cardInput = DeckHelper.getCardInput(card);
        });
        playerMemo.hand = cardsMessage.data.cards;
        //tri croissant selon cardInput
        playerMemo.hand.sort(DeckHelper.compare);
        this.cardsToNeuronalInput(playerMemo)
        /*config.NEURONAL_NETWORK_LISTENER.launchCompute( function(output){
            //game
            console.log("after response from NEURONAL_NETWORK_LISTENER.launchCompute = " + output);
        });*/
        console.log("inside CardsListener game = "+JSON.stringify(playerMemo));
    }

    cardsToNeuronalInput(playerMemo){
        playerMemo.turnsDetails[playerMemo.totalHands].neuronalInput.input.h1 = playerMemo.hand[0].cardInput;
        playerMemo.turnsDetails[playerMemo.totalHands].neuronalInput.input.h2 = playerMemo.hand[1].cardInput;
    }
}

module.exports = CardsListener;