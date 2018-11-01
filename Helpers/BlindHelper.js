const fs = require("fs");
require("../config");
const CroupierMessageHandler = require("../Croupier/CroupierMessageHandler");


class BlindHelper {

  /**
   * methode qui retourne la petite et grosse blinde pour le tour en cours
   */
  static actualizeBlinds(currentTurn) {
    let iterBlindValues = config.BLIND_EVOLUTION.keys();
    let currValue = iterBlindValues.next().value;
    while (currValue > currentTurn) {
      //console.log("currValue = " + currValue);
      //console.log("currentTurn= " + currentTurn);
      currValue = iterBlindValues.next().value
    }
    if (config.CURR_SMALL_BLIND !== config.BLIND_EVOLUTION.get(currValue)[0]) {
      //evolution des blindes qu'on broadcast aux joueurs
      this.notifyBlindEvolution(config.BLIND_EVOLUTION.get(currValue)[0], config.BLIND_EVOLUTION.get(currValue)[1]);
    }
    config.CURR_SMALL_BLIND = config.BLIND_EVOLUTION.get(currValue)[0];
    config.CURR_BIG_BLIND = config.BLIND_EVOLUTION.get(currValue)[1];
    //console.log("SMALL_BLIND = " + config.CURR_SMALL_BLIND);
    //console.log("BIG_BLIND = " + config.CURR_BIG_BLIND);
    return config.BLIND_EVOLUTION.get(currValue);
  }

  static notifyBlindEvolution(smallBlind, bigBlind) {
    let blindEvolutionMessage = {
      "id": "server.game.blind.change",
      "data": {
        "small": smallBlind,
        "big": bigBlind
      }
    };
    CroupierMessageHandler.broadcast(JSON.stringify(blindEvolutionMessage));
  }
}

module.exports = BlindHelper;