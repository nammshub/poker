const EventEmitter = require( 'events' );
var game = require('../Beans/Game');
/**
 * Ce listener gere l'event start. Il doit stocker nos infos joueur pour la partie en cours et stocker le nbr de joueur de la partie
 */
class CardsListener extends EventEmitter {
    handleMessage(cardsMessage) {
        game.hand = cardsMessage.data.cards;
        
        console.log('object game contains' + JSON.stringify(game));
    }
}

module.exports = CardsListener;