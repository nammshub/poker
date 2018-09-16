const EventEmitter = require( 'events' );
var game = require('../Beans/Game');
require('../config');

/**
 * Ce listener gere le board et les cartes qu'on y pose
 */
class BoardListener extends EventEmitter {
    handleMessage(newCardsMessage) {
        let currTapis = game.turnsDetails[game.turnsDetails.length - 1].tapis;
        currTapis = currTapis.concat(newCardsMessage.data.cards);
        game.turnsDetails[game.turnsDetails.length - 1].tapis = currTapis;
        console.log('Board mis à jour coté joueur avec '+ newCardsMessage.data.cards.length + ' nouvelles cartes');
    }
}

module.exports = BoardListener;