const EventEmitter = require( 'events' );
class TCPListener extends EventEmitter {
    handleTCPData(data) {
        // 3 types de data possibles
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