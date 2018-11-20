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
        this.establishWinLoseInput(playerMemo);
        //enregistrement des coups dans le fichier de log
        playerMemo.turnsDetails[playerMemo.totalHands].neuronalInputs.forEach(function (currInput) {
            LogHelper.logNeuronalInput(JSON.stringify(currInput), playerMemo.logFile);
        });
    }

    establishWinLoseInput(playerMemo) {
        const lastTurnChips = playerMemo.turnsDetails[playerMemo.totalHands - 1].chipsEndTurn;
        const currTurnChips = playerMemo.turnsDetails[playerMemo.totalHands].chipsEndTurn;
        console.log("playerMemo.totalHands =" + playerMemo.totalHands);
        console.log("lastTurnChips =" + lastTurnChips);
        console.log("currTurnChips =" + currTurnChips);
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

    getHandMyBet(playerMemo) {
        let sum = 0;
        playerMemo.turnsDetails[playerMemo.totalHands].betsMap.forEach(function (currArray, playerId) {
            if (playerId === playerMemo.player.id) {
                let iterStep = -1;
                while (iterStep < playerMemo.turnsDetails[playerMemo.totalHands].turnStep) {
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