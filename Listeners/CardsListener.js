const EventEmitter = require("events");
require("../config");
const HandValueHelper = require("../Helpers/HandValueHelper");
const HandStrengthHelper = require("../Helpers/HandStrengthHelper");


/**
 * Ce listener gere l"event cards. Il doit stocker nos cartes du tour
 */
class CardsListener extends EventEmitter {
    handleMessage(cardsMessage, playerMemo) {
        playerMemo.turnsDetails[playerMemo.totalHands].hand = cardsMessage.data.cards;
        HandValueHelper.handValueToNeuronalInput(playerMemo);
        //on calcule la force de la main
        const handStrength = HandStrengthHelper.getHandStrength(playerMemo.turnsDetails[playerMemo.totalHands].hand, [], playerMemo.listPlayers.length - 1);
        playerMemo.turnsDetails[playerMemo.totalHands].currInput.input['handStrength'] = handStrength;
    }
}

module.exports = CardsListener;