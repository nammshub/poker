const EventEmitter = require( 'events' );
var game = require('../Beans/Game');
/**
 * Ce listener gere l'event start. Il doit stocker nos infos joueur pour la partie en cours et stocker le nbr de joueur de la partie
 */
class StartListener extends EventEmitter {
    handleMessage(startMessage) {
        game.player = startMessage.data.info;
        game.nbJoueurs = startMessage.data.count;

        console.log('object game contains' + JSON.stringify(game));
    }
}

module.exports = StartListener;