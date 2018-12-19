const EventEmitter = require("events");
require("../config");
const HandStrengthHelper = require("../Helpers/HandStrengthHelper");
const handStrengthHelper = new HandStrengthHelper();



/**
 * Ce listener gere le board et les cartes qu"on y pose
 */
class BoardListener extends EventEmitter {
    handleMessage(newCardsMessage, playerMemo) {
        let currTapis = playerMemo.turnsDetails[playerMemo.totalHands].tapis;
        currTapis = currTapis.concat(newCardsMessage.data.cards);
        playerMemo.turnsDetails[playerMemo.totalHands].tapis = currTapis;
        //on increment le handStep
        playerMemo.turnsDetails[playerMemo.totalHands].handStep++;
        //on injecte dans le neuronal SSI le joueur est toujours actif sinon les calculs de valeur de main sont fausses
        if (playerMemo.turnsDetails[playerMemo.totalHands].state === "ACTIVE") {
            //on maj le input neuronal avec les cartes:
            //HandValueHelper.handValueToNeuronalInput(playerMemo);
            //on calcule la force de la main
            console.log("player id =" + playerMemo.player.id + " step = " + playerMemo.turnsDetails[playerMemo.totalHands].handStep);
            const handStrength = handStrengthHelper.getHandStrength(playerMemo.turnsDetails[playerMemo.totalHands].hand, currTapis, playerMemo.listPlayers.length - 1);
            playerMemo.turnsDetails[playerMemo.totalHands].currInput.input[this.getStepName(playerMemo.turnsDetails[playerMemo.totalHands].handStep)+'_handStrength'] = handStrength;
            //on ajoute dans le input l'evolution du step
           // this.stepToNeuronalInput(playerMemo);

           //On remet les stepTurn à 0
           playerMemo.turnsDetails[playerMemo.totalHands].stepTurn = 0;
        }
    }

    stepToNeuronalInput(playerMemo) {
        const currStep = playerMemo.turnsDetails[playerMemo.totalHands].handStep;
        //playerMemo.turnsDetails[playerMemo.totalHands].currInput.input.step = currStep / 4;
    }

    getStepName(stepNbr){
        switch(stepNbr){
            case 0:
                return 'preflop';
            case 1:
                return 'flop';
            case 2:
                return 'turn';
            case 3:
                return 'river';
            default:
                console.log('step inconnu !!' + stepNbr);
                return 'unknown';
        }
    }
}

module.exports = BoardListener;