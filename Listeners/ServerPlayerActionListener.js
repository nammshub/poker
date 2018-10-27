/**
 * gestion de l'evenement un autre joueur a joue, il faut enregistre son coup dans le tour en cours
 */
class ServerPlayerActionListener {

    handleMessage(message, playerMemo) {
        const chipsPlayed = message.data.value;
        const playerId = message.data.id;
        this.pushPlayerBets(playerId, chipsPlayed, playerMemo);
    }

    pushPlayerBets(playerId, chipsPlayed, playerMemo) {
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
        const turnStep = playerMemo.turnsDetails[playerMemo.totalHands].turnStep;
        let betsArray = playerMemo.turnsDetails[playerMemo.totalHands].betsMap.get(playerId);
        if (!betsArray) {
            betsArray = [[], [], [], []];
        }
        betsArray[turnStep].push(chipsPlayed);
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
            console.log(" mises pour la phase " + posString + " pour le joueur " + playerId + " = " + sumStepChips);
        })
    }

    pushNeuronalInput(playerId, chipsPlayed, playerMemo) {
        if(playerId === playerMemo.player.id){
            return;
        }
        //on recupere la position du joueur pour ce tour
        const playerPos = playerMemo.turnsDetails[playerMemo.totalHands].positionMap.get(playerId);
        const stepNbr = playerMemo.turnsDetails[playerMemo.totalHands].turnStep;

        /*on recupere le code step turn a injecter
        let step;
        switch (stepNbr) {
            case 0:
                step = "pf"
                break;
            case 1:
                step = "f"
                break;
            case 2:
                step = "t"
                break;
            case 3:
                step = "r"
                break;
        }
        */
        //nbr d'action pour ce joueur pour ce step
        let actionNbr = playerMemo.turnsDetails[playerMemo.totalHands].betsMap.get(playerId)[stepNbr].length;
        //let neuronalChips = chipsPlayed / playerMemo.potTotal;
        //On va logger une action (FOLD,CHECK,RAISE) plutot que un montant d'argent

        let stepMaxBet = 0;

        let playerSumBet = 0;

        playerMemo.turnsDetails[playerMemo.totalHands].betsMap.forEach(function (currArray, betsPlayerId) {

            let stepSumBet = 0;

            currArray[stepNbr].forEach(function (bet) {

                stepSumBet += bet;

            });

            if (stepSumBet > stepMaxBet) {

                stepMaxBet = stepSumBet;

            }

            if (playerId === betsPlayerId) {

                playerSumBet = stepSumBet;

            }

        });

        //on fold par defaut

        let playerAction = 0;

        if (stepMaxBet === playerSumBet + chipsPlayed) {

            //le joueur check

            playerAction = 0.5;

        }

        if (stepMaxBet < playerSumBet + chipsPlayed) {

            //le joueur raise

            playerAction = 1;

        }



        //on injecte dans playerMemo cette action

        playerMemo.turnsDetails[playerMemo.totalHands].currInput.input["p" + playerPos + "_" + actionNbr] = playerAction;
    }
}

module.exports = ServerPlayerActionListener;
