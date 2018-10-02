const fs = require('fs');
require('../config');

class BlindHelper{

    /**
     * methode qui retourne la petite et grosse blinde pour le tour en cours
     */
    static actualizeBlinds(currentTurn) {
        let iterBlindValues = config.BLIND_EVOLUTION.keys();
        let currValue = iterBlindValues.next().value;
        while (currValue > currentTurn) {
          console.log('currValue = ' + currValue);
          console.log('currentTurn= ' + currentTurn);
          currValue = iterBlindValues.next().value
        }
        config.CURR_SMALL_BLIND = config.BLIND_EVOLUTION.get(currValue)[0];
        config.CURR_BIG_BLIND = config.BLIND_EVOLUTION.get(currValue)[1];
        console.log('SMALL_BLIND = ' + config.CURR_SMALL_BLIND);
        console.log('BIG_BLIND = ' + config.CURR_BIG_BLIND);
        return config.BLIND_EVOLUTION.get(currValue);
      }
}

module.exports =  BlindHelper;