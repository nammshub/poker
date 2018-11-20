const EventEmitter = require("events");
require("../config");
const HandValueHelper = require("../Helpers/HandValueHelper");
const HandStrengthHelper = require("../Helpers/HandStrengthHelper");



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
            //HandValueHelper.handValueToNeuronalInput(playerMemo);
            //on calcule la force de la main
            const handStrength = HandStrengthHelper.getHandStrength(playerMemo.turnsDetails[playerMemo.totalHands].hand, currTapis, playerMemo.listPlayers.length - 1);
            playerMemo.turnsDetails[playerMemo.totalHands].currInput.input['handStrength'] = handStrength;
            //on ajoute dans le input l'evolution du step
            this.stepToNeuronalInput(playerMemo);
        }
    }

    stepToNeuronalInput(playerMemo) {
        const currStep = playerMemo.turnsDetails[playerMemo.totalHands].turnStep;
        playerMemo.turnsDetails[playerMemo.totalHands].currInput.input.step = currStep / 4;
    }
}

module.exports = BoardListener;