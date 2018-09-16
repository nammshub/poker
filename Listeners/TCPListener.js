const EventEmitter = require( 'events' );
const StartListener = require('./StartListener');
const CardsListener = require('./CardsListener');
const HandStartListener = require('./HandStartListener');
const PlayListener = require('./PlayListener');
const BoardListener = require('./BoardListener');


const startListener = new StartListener();
const cardsListener = new CardsListener();
const handStartListener = new HandStartListener();
const playListener = new PlayListener();
const boardListener = new BoardListener();
class TCPListener extends EventEmitter {
    handleTCPData(data,callback) {
        console.log('\n inside TCPListener. Data = '+data);
        const message = JSON.parse(data);
        switch (message.id){
            case 'server.game.start':
                console.log('Le jeu commence !! nbr joueurs = '+message.data.count);
                startListener.handleMessage(message);
                break;
            case 'server.game.cards':
                console.log('Un joueur recoit ses cartes');
                cardsListener.handleMessage(message);
                break;
            case 'server.game.hand.start':
                console.log('Une nouvelle main commence');
                handStartListener.handleMessage(message);
                break;
            case 'server.game.play':
                console.log('A vous de jouer');
                playListener.handleMessage(callback);
                break;
            case 'server.game.board.cards':
                console.log('Nouvelles cartes sur le board');
                boardListener.handleMessage(message,callback);
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