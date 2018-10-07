const EventEmitter = require( "events" );
require("../config");

/**
 * Ce listener gere le board et les cartes qu"on y pose
 */
class BoardListener extends EventEmitter {
    handleMessage(newCardsMessage, playerMemo) {
        let currTapis = playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].tapis;
        currTapis = currTapis.concat(newCardsMessage.data.cards);
        playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].tapis = currTapis;
        console.log("Board mis à jour coté joueur avec "+ newCardsMessage.data.cards.length + " nouvelles cartes");
    }
}

module.exports = BoardListener;