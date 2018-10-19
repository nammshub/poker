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
        LogHelper.logNeuronalInput(JSON.stringify(playerMemo.turnsDetails[playerMemo.totalHands].neuronalInput), playerMemo.logFile);
        //si on repere un gain alors qu'on a fold => il y a un soucis à analyser
        if (playerMemo.turnsDetails[playerMemo.totalHands].neuronalInput.input.winLose > 0.5 && playerMemo.turnsDetails[playerMemo.totalHands].neuronalInput.output.chips === 0) {
            throw new Error("gain alors que fold...");
        }
    }

    establishWinLoseInput(playerMemo) {
        const lastTurnChips = playerMemo.turnsDetails[playerMemo.turnsDetails.length - 2].chipsEndTurn;
        const currTurnChips = playerMemo.turnsDetails[playerMemo.totalHands].chipsEndTurn;
        let winLose;
        if (lastTurnChips === currTurnChips) {
            winLose = 0.5;
        }
        if (lastTurnChips > currTurnChips) {
            //perte => on va se situer entre 0 et 0.5
            /*
             calcul (currTurnChips/lastTurnChips) / 2
            */
            winLose = (currTurnChips / lastTurnChips) / 2;
        }
        if (lastTurnChips < currTurnChips) {
            //on a fait un gain => on se situe entre 0.5 et 1 (qui represente total chips)
            winLose = 0.5 + ((currTurnChips - lastTurnChips) / ((playerMemo.potTotal - lastTurnChips) * 2))
        }
        playerMemo.turnsDetails[playerMemo.totalHands].neuronalInput.input.winLose = winLose;
    }
}

module.exports = HandEndListener;