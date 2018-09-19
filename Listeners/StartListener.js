const EventEmitter = require( 'events' );
require('../config');
/**
 * Ce listener gere l'event start. Il doit stocker nos infos joueur pour la partie en cours et stocker le nbr de joueur de la partie
 */
class StartListener extends EventEmitter {
    handleMessage(startMessage,playerMemo) {
        playerMemo.player = startMessage.data.info;
        playerMemo.nbJoueursActifs = startMessage.data.count;
        console.log('\nStart event. playerMemo = ' + JSON.stringify(playerMemo));
    }
}

module.exports = StartListener;