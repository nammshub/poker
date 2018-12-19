const LogHelper = require("../Helpers/LogHelper");

//var game = [r: 0.03, g: 0.7, b: 0.5];

/**
 * Ce listener gere l"event end. Il doit stocker nos résultats de partie
 */
class HandEndListener {
    handleMessage(endMessage, playerMemo) {
        //calcul si les coups joues ce tour ci etaient bon ou nuls
        let winner = false;
        endMessage.data.winners.forEach(function (player) {
            console.log("winner id =" + player.id);
            console.log("winner chips =" + player.chips);


            if (player.id === playerMemo.player.id) {
                playerMemo.player.chips = player.chips;
                winner = true;
            }
        })
        if (winner) {
            playerMemo.turnsDetails[playerMemo.totalHands].chipsEndTurn = playerMemo.player.chips;
        }
        else {
            playerMemo.turnsDetails[playerMemo.totalHands].chipsEndTurn = playerMemo.player.chips - this.getHandMyBet(playerMemo);
        }
        this.establishWinLoseOutput(playerMemo);
        //enregistrement des coups dans le fichier de log
        LogHelper.logNeuronalInput(JSON.stringify(playerMemo.turnsDetails[playerMemo.totalHands].currInput), playerMemo.logFile);

    }

    establishWinLoseOutput(playerMemo) {
        const lastTurnChips = playerMemo.turnsDetails[playerMemo.totalHands - 1].chipsEndTurn;
        const currTurnChips = playerMemo.turnsDetails[playerMemo.totalHands].chipsEndTurn;
        console.log("playerMemo.totalHands =" + playerMemo.totalHands);
        console.log("lastTurnChips =" + lastTurnChips);
        console.log("currTurnChips =" + currTurnChips);
        let winLose = 0.5;
        if (lastTurnChips > currTurnChips) {
            //perte => on va se situer entre 0 et 0.5 (0 = perte totale, 0.5 = statu quo)
            winLose = Math.max(0,currTurnChips / (2 * lastTurnChips));
        }
        if (lastTurnChips < currTurnChips) {
            //on a fait un gain => on se situe entre 0.5 et 1 (0.5 = statu quo 1 => victoire partie)
            winLose = Math.min(0.5 + ((currTurnChips - lastTurnChips) / ((playerMemo.potTotal - lastTurnChips) * 2)),1);
        }
        playerMemo.turnsDetails[playerMemo.totalHands].currInput.output.winLose = winLose;
    }

    getHandMyBet(playerMemo) {
        let sum = 0;
        playerMemo.turnsDetails[playerMemo.totalHands].betsMap.forEach(function (currArray, playerId) {
            if (playerId === playerMemo.player.id) {
                let iterStep = -1;
                while (iterStep < playerMemo.turnsDetails[playerMemo.totalHands].handStep) {
                    iterStep++;
                    currArray[iterStep].forEach(function (bet) {
                        sum += bet;
                    });
                }
            }
        });
        return sum;
    }
}

module.exports = HandEndListener;