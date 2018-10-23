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
        //on injecte dans le neuronal SSI le joueur est toujours actif sinon les calculs de valeur de main sont fausses
        if (playerMemo.turnsDetails[playerMemo.totalHands].state === "ACTIVE") {
            //on maj le input neuronal avec les cartes:
            HandValueHelper.handValueToNeuronalInput(playerMemo);
            //on ajoute dans le input l'evolution du step
            this.stepToNeuronalInput(playerMemo);
        }
        console.log("Board mis à jour coté joueur avec " + newCardsMessage.data.cards.length + " nouvelles cartes");
    }

    stepToNeuronalInput(playerMemo) {
        const currStep = playerMemo.turnsDetails[playerMemo.totalHands].turnStep;
        playerMemo.turnsDetails[playerMemo.totalHands].currInput.input.step = currStep / 4;
    }
}

module.exports = BoardListener;