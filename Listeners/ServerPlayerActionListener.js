/**
 * gestion de l'evenement un autre joueur a joue, il faut enregistre son coup dans le tour en cours
 */
class ServerPlayerActionListener {

    handleMessage(message, playerMemo) {
        const chipsPlayed = message.data.action.value;
        const playerId = message.id;
        this.pushPlayerBets(playerId, chipsPlayed, playerMemo);
        //ajout du coup dans notre neuronalInput
        this.pushNeuronalInput(playerId, chipsPlayed, playerMemo);
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
        const turnStep = playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].turnStep;
        let betsArray = playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].betsMap.get(playerId);
        if (!betsArray) {
            betsArray = [[], [], [], []];
        }
        betsArray[turnStep].push(chipsPlayed);
        playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].betsMap.set(playerId, betsArray);
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
            console.log(" mises pour la phase " + posString);
            currArray.forEach(function (chips) {
                console.log(" " + chips + " ");
            })
        })
    }

    pushNeuronalInput(playerId, chipsPlayed, playerMemo) {
        //on recupere la position du joueur pour ce tour
        const playerPos = playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].positionMap.get(playerId);
        //on recupere le code step turn a injecter
        const stepNbr = playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].turnStep;
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
        //nbr d'action pour ce joueur pour ce step
        let actionNbr = playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].betsMap.get(playerId)[stepNbr].length;
        let neuronalChips = chipsPlayed / playerMemo.potTotal;
        //on injecte dans playerMemo cette action
        playerMemo.turnsDetails[playerMemo.turnsDetails.length - 1].neuronalInput.input["p" + playerPos + "_" + step + "_" + actionNbr] = neuronalChips;
    }
}

module.exports = ServerPlayerActionListener;
