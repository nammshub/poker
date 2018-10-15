/**
 * gestion de l'evenement un autre joueur a joue, il faut enregistre son coup dans le tour en cours
 */
class ServerPlayerActionListener {
    static handleMessage(message, playerMemo) {
        const chipsPlayed = message.action.value;
        const playerId = message.id;
        this.pushPlayerBets(playerId, chipsPlayed, playerMemo);
    }

    static pushPlayerBets(playerId, chipsPlayed, playerMemo) {
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
            currArray.forEach(function(chips){
                console.log(" "+chips+" ");
            })
        })
    }
}

module.exports = ServerPlayerActionListener;
