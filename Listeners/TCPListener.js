const EventEmitter = require( 'events' );
const StartListener = require('./StartListener');

const startListener = new StartListener();
class TCPListener extends EventEmitter {
    handleTCPData(data) {
        const message = JSON.parse(data);
        switch (message.id){
            case 'server.game.start':
            console.log('Le jeu commence !! nbr joueurs = '+message.data.count);
            startListener.handleMessage(message);
            break;
        case 'server.game.cards':
            console.log('Un joueur recoit ses cartes');
            break;
    }
        //  11 types de data possibles
        console.log('DATA from tcpListener: ' + data);

        /*
        if ( !err )
            this.emit( 'success', result );
        else
            this.emit( 'error', err );
            */
    }
}

module.exports = TCPListener;