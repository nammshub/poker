const EventEmitter = require("events");
require("../config");
const HandStrengthHelper = require("../Helpers/HandStrengthHelper");

const handStrengthHelper = new HandStrengthHelper();


/**
 * Ce listener gere l"event cards. Il doit stocker nos cartes du tour
 */
class CardsListener extends EventEmitter {
    handleMessage(cardsMessage, playerMemo) {
        playerMemo.turnsDetails[playerMemo.totalHands].hand = cardsMessage.data.cards;
        //HandValueHelper.handValueToNeuronalInput(playerMemo);
        //on calcule la force de la main
        const handStrength = handStrengthHelper.getHandStrength(playerMemo.turnsDetails[playerMemo.totalHands].hand, [], playerMemo.listPlayers.length - 1);
        playerMemo.turnsDetails[playerMemo.totalHands].currInput.input['preflop_handStrength'] = handStrength;
    }
}

module.exports = CardsListener;