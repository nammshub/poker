const EventEmitter = require('events');

class CroupierMessageHandler extends EventEmitter {
    static handleData(data) {
        const message = JSON.parse(data);
        switch (message.id) {
            case 'server.game.start':
                console.log('Le jeu commence !! nbr joueurs = ' + message.data.count);
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
                playListener.handleMessage(message);
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

    // Send a message to all clients
    static broadcast(message, sender) {
        config.PLAYERS.forEach(function (player) {
            // Don't want to send it to sender
            if (player === sender) return;
            player.socket.write(message);
        });
        // Log it to the server output too
        //process.stdout.write(message)
    }
}

module.exports = CroupierMessageHandler;