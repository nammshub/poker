/**
 * gestion de l'evenement un autre joueur a joue, il faut enregistre son coup dans le tour en cours
 */
class ServerPlayerActionListener {

    handleMessage(message, playerMemo) {
        const chipsPlayed = message.data.value;
        const playerId = message.data.id;
        if(playerMemo.turnsDetails[playerMemo.totalHands].nbrBlindPayed < 2){
            playerMemo.turnsDetails[playerMemo.totalHands].nbrBlindPayed++;
        }else{
          this.injectActionRatio(playerId, chipsPlayed, playerMemo);
        }
        this.pushPlayerBets(playerId, chipsPlayed, playerMemo);
        this.pushNeuronalInput(playerId, playerMemo);
    }

    pushPlayerBets(playerId, chipsPlayed, playerMemo) {
        //console.log("un jouer à joue (" + playerId + ") chips = " + chipsPlayed);
        //recuperation de la map des bets. On va injecter pour ce joueur 
        /*
        {
            joueur 1: { [
                //mises du preflop
                [],
                //mises du flop
                [],
                //mises du turn
                [],
                //mises du river
                []

            ]},
            joueur 2 ...
        }
        */
        const handStep = playerMemo.turnsDetails[playerMemo.totalHands].handStep;
        let betsArray = playerMemo.turnsDetails[playerMemo.totalHands].betsMap.get(playerId);
        if (!betsArray) {
            betsArray = [[], [], [], []];
        }
        let stepSumBet = this.getStepPlayerBet(playerMemo, playerId);
        betsArray[handStep].push(chipsPlayed - stepSumBet);
        playerMemo.turnsDetails[playerMemo.totalHands].betsMap.set(playerId, betsArray);
        betsArray.forEach(function (currArray, position) {
            let posString;
            switch (position) {
                case 0:
                    posString = "preflop";
                    break;
                case 1:
                    posString = "flop";
                    break;
                case 2:
                    posString = "turn";
                    break;
                case 3:
                    posString = "river";
                    break;
            }
            let sumStepChips = 0;
            currArray.forEach(function (chips) {
                sumStepChips += chips;
            })
            //console.log(" mises pour la phase " + posString + " pour le joueur " + playerId + " = " + sumStepChips);
        })
    }

    pushNeuronalInput(playerId, playerMemo) {
        if (playerId === playerMemo.player.id) {
            return;
        }
        //on recupere la position du joueur pour ce tour
        const playerPos = playerMemo.turnsDetails[playerMemo.totalHands].positionMap.get(playerId);
        let percentBets = 0;
        //on recupere le nombre de jetons que le joueur avait au debut de la main
        let totalChips = 1;
        const _this = this;
        playerMemo.listPlayers.forEach(function (player) {
            if (player.id === playerId) {
                totalChips = player.chips;
                const alreadyBet = _this.getHandPlayerBet(playerMemo, playerId);
                percentBets = alreadyBet / totalChips;
                //on injecte dans playerMemo cette info
                //playerMemo.turnsDetails[playerMemo.totalHands].currInput.input["percentBets_" + playerPos] = percentBets;
                //console.log("percentBets pour joueur en position " + playerPos + " = " + percentBets + " soit mises main = " + alreadyBet + " sur total chips = " + totalChips);
            }
        })

    }

    getStepPlayerBet(playerMemo, currPlayerId) {
        let sum = 0;
        playerMemo.turnsDetails[playerMemo.totalHands].betsMap.forEach(function (currArray, playerId) {
            if (playerId === currPlayerId) {
                currArray[playerMemo.turnsDetails[playerMemo.totalHands].handStep].forEach(function (bet) {
                    sum += bet;
                });
            }
        });
        return sum;
    }

    getHandPlayerBet(playerMemo, currPlayerId) {
        let sum = 0;
        playerMemo.turnsDetails[playerMemo.totalHands].betsMap.forEach(function (currArray, playerId) {
            if (playerId === currPlayerId) {
                for (let iter = 0; iter <= playerMemo.turnsDetails[playerMemo.totalHands].handStep; iter++) {
                    currArray[iter].forEach(function (bet) {
                        sum += bet;
                    });
                }
            }
        });
        return sum;
    }

    injectActionRatio(playerId, chipsPlayed, playerMemo) {
        let playerActionRatioMap = playerMemo.actionRatioMap.get(playerId);
        const stepMaxBet = this.getStepMaxBet(playerMemo);
        let check = false;
        let raise = false;
        switch (true) {
            case (chipsPlayed < stepMaxBet):
                //console.log("one more fold for player id " + playerId);
                playerActionRatioMap.set("FOLD", playerActionRatioMap.get("FOLD") + 1);
                break;
            case (chipsPlayed === stepMaxBet):
                //console.log("one more check for player id " + playerId);
                playerActionRatioMap.set("CHECK", playerActionRatioMap.get("CHECK") + 1);
                check = true;
                break;
            case (chipsPlayed > stepMaxBet):
                //console.log("one more raise for player id " + playerId);
                playerActionRatioMap.set("RAISE", playerActionRatioMap.get("RAISE") + 1);
                raise = true;
                break;
        }
        const totalActions = playerActionRatioMap.get("FOLD") + playerActionRatioMap.get("CHECK") + playerActionRatioMap.get("RAISE");
        const playerPos = playerMemo.turnsDetails[playerMemo.totalHands].positionMap.get(playerId);
        //si le joueur n'est pas habituellement aggressif et qu'il fait un raise, on le signale
        if(raise && (playerActionRatioMap.get("RAISE") / totalActions) < 0.5 ){
            playerMemo.turnsDetails[playerMemo.totalHands].currInput.input[this.getStepName(playerMemo.turnsDetails[playerMemo.totalHands].handStep)+"_unusualRaise"] = 1;
        }
        //playerMemo.turnsDetails[playerMemo.totalHands].currInput.input[this.getStepName(playerMemo.turnsDetails[playerMemo.totalHands].handStep)+"_"+playerMemo.turnsDetails[playerMemo.totalHands].stepTurn+"_percentRaise_" + playerPos] = playerActionRatioMap.get("RAISE") / totalActions;
       // playerMemo.turnsDetails[playerMemo.totalHands].currInput.input[this.getStepName(playerMemo.turnsDetails[playerMemo.totalHands].handStep)+"_"+playerMemo.turnsDetails[playerMemo.totalHands].stepTurn+"_percentCheck_" + playerPos] = playerActionRatioMap.get("CHECK") / totalActions;
       // playerMemo.turnsDetails[playerMemo.totalHands].currInput.input[this.getStepName(playerMemo.turnsDetails[playerMemo.totalHands].handStep)+"_"+playerMemo.turnsDetails[playerMemo.totalHands].stepTurn+"_percentFold_" + playerPos] = playerActionRatioMap.get("FOLD") / totalActions;
    }

    getStepMaxBet(playerMemo) {
        let maxBet = 0;
        playerMemo.turnsDetails[playerMemo.totalHands].betsMap.forEach(function (currArray) {
            let sum = 0;
            currArray[playerMemo.turnsDetails[playerMemo.totalHands].handStep].forEach(function (bet) {
                sum += bet;
            });
            if (sum > maxBet) {
                maxBet = sum;
            }
        });
        return maxBet;
    }

    getStepName(stepNbr){
        switch(stepNbr){
            case 0:
                return 'preflop';
            case 1:
                return 'flop';
            case 2:
                return 'turn';
            case 3:
                return 'river';
            default:
                console.log('step inconnu !!' + stepNbr);
                return 'unknown';
        }
    }
}

module.exports = ServerPlayerActionListener;
