const EventEmitter = require("events");
require("../config");
const DeckHelper = require("../Helpers/DeckHelper");
const HandValueHelper = require("../Helpers/HandValueHelper");


/**
 * Ce listener gere le board et les cartes qu"on y pose
 */
class BoardListener extends EventEmitter {
    handleMessage(newCardsMessage, playerMemo) {
        let currTapis = playerMemo.turnsDetails[playerMemo.totalHands].tapis;
        currTapis = currTapis.concat(newCardsMessage.data.cards);
        playerMemo.turnsDetails[playerMemo.totalHands].tapis = currTapis;
        //on increment le turnStep
        playerMemo.turnsDetails[playerMemo.totalHands].turnStep++;
        //on maj le input neuronal avec les cartes:
        HandValueHelper.handValueToNeuronalInput(playerMemo);
        //on ajoute dans le input l'evolution du step
        this.stepToNeuronalInput(playerMemo);
        console.log("Board mis à jour coté joueur avec " + newCardsMessage.data.cards.length + " nouvelles cartes");
    }

    stepToNeuronalInput(playerMemo) {
        const currStep = playerMemo.turnsDetails[playerMemo.totalHands].turnStep;
        playerMemo.turnsDetails[playerMemo.totalHands].neuronalInput.input.step = currStep / 4;
    }
}

module.exports = BoardListener;