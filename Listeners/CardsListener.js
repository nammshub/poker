const EventEmitter = require( "events" );
require("../config");
const DeckHelper = require("../Helpers/DeckHelper");
const HandValueHelper = require("../Helpers/HandValueHelper");

/**
 * Ce listener gere l"event cards. Il doit stocker nos cartes du tour
 */
class CardsListener extends EventEmitter {
    handleMessage(cardsMessage, playerMemo) {
        playerMemo.turnsDetails[playerMemo.totalHands].hand = cardsMessage.data.cards;
        HandValueHelper.handValueToNeuronalInput(playerMemo);
    }
}

module.exports = CardsListener;