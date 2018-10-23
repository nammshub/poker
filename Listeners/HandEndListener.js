const LogHelper = require("../Helpers/LogHelper");

//var game = [r: 0.03, g: 0.7, b: 0.5];

/**
 * Ce listener gere l"event end. Il doit stocker nos résultats de partie
 */
class HandEndListener {
    handleMessage(endMessage, playerMemo) {
        //calcul si les coups joues ce tour ci etaient bon ou nuls
        endMessage.data.winners.forEach(function (player) {
            if (player.id === playerMemo.player.id) {
                playerMemo.player.chips = player.chips;
            }
        })
        playerMemo.turnsDetails[playerMemo.totalHands].chipsEndTurn = playerMemo.player.chips;
        this.establishWinLoseInput(playerMemo);
        //enregistrement des coups dans le fichier de log
        playerMemo.turnsDetails[playerMemo.totalHands].neuronalInputs.forEach(function (currInput) {
            LogHelper.logNeuronalInput(JSON.stringify(currInput), playerMemo.logFile);
        });
    }

    establishWinLoseInput(playerMemo) {
        const lastTurnChips = playerMemo.turnsDetails[playerMemo.turnsDetails.length - 2].chipsEndTurn;
        const currTurnChips = playerMemo.turnsDetails[playerMemo.totalHands].chipsEndTurn;
        let win = 0;
        let lose = 0;
        if (lastTurnChips > currTurnChips) {
            //perte => on va se situer entre 0 et 1 (tous nos chips)
            lose = (lastTurnChips - currTurnChips) / playerMemo.potTotal;
        }
        if (lastTurnChips < currTurnChips) {
            //on a fait un gain => on se situe entre 0 et 1 (qui represente total chips)
            win = ((currTurnChips - lastTurnChips) / ((playerMemo.potTotal - lastTurnChips)))
        }
        playerMemo.turnsDetails[playerMemo.totalHands].neuronalInputs.forEach(function (currInput) {
            currInput.input.Win = win;
            currInput.input.Lose = lose;
        });
    }
}

module.exports = HandEndListener;