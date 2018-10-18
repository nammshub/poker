const EventEmitter = require("events");
require("../config");
const DeckHelper = require("../Helpers/DeckHelper");


/**
 * Ce listener gere le board et les cartes qu"on y pose
 */
class BoardListener extends EventEmitter {
    handleMessage(newCardsMessage, playerMemo) {
        //on injecte le cardInput dans chaque carte recue
        newCardsMessage.data.cards.forEach(function (card) {
            card.cardInput = DeckHelper.getCardInput(card);
        });
        let currTapis = playerMemo.turnsDetails[playerMemo.totalHands].tapis;
        currTapis = currTapis.concat(newCardsMessage.data.cards);
        //on trie le tapis selon le cardInput
        currTapis.sort(DeckHelper.compare);
        playerMemo.turnsDetails[playerMemo.totalHands].tapis = currTapis;
        //on increment le turnStep
        playerMemo.turnsDetails[playerMemo.totalHands].turnStep++;
        console.log("Board mis à jour coté joueur avec " + newCardsMessage.data.cards.length + " nouvelles cartes");
    }
}

module.exports = BoardListener;