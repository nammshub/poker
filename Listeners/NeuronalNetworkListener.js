const EventEmitter = require( "events" );
require("../config");

/**
 * Ce listener gere l"event start. Il doit stocker nos infos joueur pour la partie en cours et stocker le nbr de joueur de la partie
 */
class NeuronalNetworkListener extends EventEmitter {

    launchCompute(callback) {
        /*var output = config.NEURONAL_NETWORK.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.81, black: 0.18 }
        */
        //console.log("inside NeuronalNetworkListener.launchCompute");
        setTimeout(function () {
            callback("toto");
        }, 5000);
        
    }
}

module.exports = NeuronalNetworkListener;