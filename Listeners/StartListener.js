const EventEmitter = require("events");
require("../config");
/**
 * Ce listener gere l"event start. Il doit stocker nos infos joueur pour la partie en cours et stocker le nbr de joueur de la partie
 */
class StartListener extends EventEmitter {
    handleMessage(startMessage, playerMemo) {
        playerMemo.player = startMessage.data.info;
        playerMemo.potTotal = startMessage.data.count * playerMemo.player.chips;
        playerMemo.turnsDetails[0].chipsEndTurn = playerMemo.player.chips;
        console.log("\nStart event. playerMemo = " + JSON.stringify(playerMemo));
    }
}

module.exports = StartListener;