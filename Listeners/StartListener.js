const EventEmitter = require( 'events' );
require('../config');
var game = require('../Beans/Game');
/**
 * Ce listener gere l'event start. Il doit stocker nos infos joueur pour la partie en cours et stocker le nbr de joueur de la partie
 */
class StartListener extends EventEmitter {
    handleMessage(startMessage) {
        game.player = startMessage.data.info;
        config.MY_PLAYER = startMessage.data.info;
        game.nbJoueursActifs = startMessage.data.count;
        console.log('\nStart event. Game = ' + JSON.stringify(game));
    }
}

module.exports = StartListener;