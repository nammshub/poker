const EventEmitter = require( 'events' );
var game = require('../Beans/Game');
const NeuronalNetworkListener = require('./NeuronalNetworkListener');
/**
 * Ce listener gere l'event play. Il doit activer les calculs et repondre au croupier dans les temps impartis
 */
class PlayListener extends EventEmitter {
  

    handleMessage(playerMemo, callback) {
        //config.NEURONAL_NETWORK_LISTENER.launchCompute( function(output){
        let randomValue = this.getRandomInt(0,playerMemo.player.chips);
        let randomSecondes = this.getRandomInt(1,config.MAX_SEC_TO_ANSWER + 5);
        console.log('random value = '+randomValue+' and randomSecondes = '+randomSecondes);
        let messageJson = {
            "id": "player.action",
            "data": {
              "action": {
                  "value" :randomValue
              }
            }
          }
          setTimeout(function () {
            
            callback(messageJson);
          }, 1000*randomSecondes);  
    }


    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = PlayListener;